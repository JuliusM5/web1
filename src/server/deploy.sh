#!/bin/bash
# server/deploy.sh

# Set environment (staging or production)
ENV=${1:-staging}
REGION="us-central1"

if [ "$ENV" = "production" ]; then
  PROJECT_ID="travel-planner-production"
  GCP_SERVICE_NAME="travel-planner-api"
else
  PROJECT_ID="travel-planner-staging"
  GCP_SERVICE_NAME="travel-planner-api-staging"
fi

echo "Deploying to $ENV environment..."

# Ensure gcloud is configured with the right project
gcloud config set project $PROJECT_ID

# Build the Docker image
echo "Building Docker image..."
docker build -t gcr.io/$PROJECT_ID/$GCP_SERVICE_NAME .

# Push to Google Container Registry
echo "Pushing image to Container Registry..."
docker push gcr.io/$PROJECT_ID/$GCP_SERVICE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $GCP_SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$GCP_SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=$ENV,USE_MONGODB=true,MONGODB_URI=$(gcloud secrets versions access latest --secret=mongodb-uri)"

# Set up Stripe webhook events for subscription lifecycle
if [ "$ENV" = "production" ]; then
  echo "Setting up Stripe webhooks for production..."
  STRIPE_CLI_PATH="./stripe"
  
  # Ensure Stripe CLI is installed
  if [ ! -f "$STRIPE_CLI_PATH" ]; then
    echo "Downloading Stripe CLI..."
    curl -s https://github.com/stripe/stripe-cli/releases/download/v1.13.5/stripe_1.13.5_linux_x86_64.tar.gz | tar xz
  fi
  
  # Login to Stripe
  $STRIPE_CLI_PATH login
  
  # Create webhook endpoint
  API_URL=$(gcloud run services describe $GCP_SERVICE_NAME --platform managed --region $REGION --format="value(status.url)")
  $STRIPE_CLI_PATH webhooks create --api-key $(gcloud secrets versions access latest --secret=stripe-api-key) \
    --connect \
    --events="customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed" \
    --url="$API_URL/api/webhooks/stripe"
    
  echo "Webhook endpoint created at $API_URL/api/webhooks/stripe"
fi

echo "Deployment completed!"