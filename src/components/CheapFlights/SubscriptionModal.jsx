// src/components/CheapFlights/SubscriptionModal.jsx

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import MobileSubscriptionContext from '../../context/MobileSubscriptionContext';

const SubscriptionModal = ({ onClose }) => {
  const {
    isSubscribed,
    products,
    isProcessing,
    error,
    purchaseSubscription,
    restorePurchases,
    activateWithCode,
    clearError
  } = useContext(MobileSubscriptionContext);

  const [activeTab, setActiveTab] = useState('subscribe');
  const [selectedPlan, setSelectedPlan] = useState(products?.[0]?.productId || '');
  const [accessCode, setAccessCode] = useState('');

  // Handle subscription purchase
  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    const result = await purchaseSubscription(selectedPlan);
    if (result.success) {
      onClose();
    }
  };

  // Handle restore purchases
  const handleRestore = async () => {
    const result = await restorePurchases();
    if (result.success && result.isSubscribed) {
      onClose();
    }
  };

  // Handle code activation
  const handleCodeActivation = async () => {
    if (!accessCode) return;
    const result = await activateWithCode(accessCode);
    if (result.success) {
      onClose();
    }
  };

  // If already subscribed, show confirmation
  if (isSubscribed) {
    return (
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Subscription Active</Text>
          <Text style={styles.description}>
            You already have full access to all premium features.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Premium Access</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'subscribe' && styles.activeTab]}
            onPress={() => setActiveTab('subscribe')}
          >
            <Text style={[styles.tabText, activeTab === 'subscribe' && styles.activeTabText]}>
              Subscribe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'restore' && styles.activeTab]}
            onPress={() => setActiveTab('restore')}
          >
            <Text style={[styles.tabText, activeTab === 'restore' && styles.activeTabText]}>
              Restore
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'code' && styles.activeTab]}
            onPress={() => setActiveTab('code')}
          >
            <Text style={[styles.tabText, activeTab === 'code' && styles.activeTabText]}>
              Access Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subscribe Tab */}
        {activeTab === 'subscribe' && (
          <View style={styles.tabContent}>
            <Text style={styles.description}>
              Get unlimited access to premium deals and alerts
            </Text>

            <View style={styles.planOptions}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.productId}
                  style={[
                    styles.planOption,
                    selectedPlan === product.productId && styles.selectedPlan
                  ]}
                  onPress={() => setSelectedPlan(product.productId)}
                >
                  <View style={styles.planDetails}>
                    <Text style={styles.planTitle}>{product.title}</Text>
                    <Text style={styles.planPrice}>{product.localizedPrice}</Text>
                  </View>
                  <View style={styles.planRadio}>
                    {selectedPlan === product.productId && (
                      <View style={styles.planRadioInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isProcessing && styles.disabledButton]}
              onPress={handleSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Subscribe Now</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Payment will be charged to your App Store/Google Play account.
              Subscriptions automatically renew unless canceled at least 24 hours
              before the end of the current period.
            </Text>
          </View>
        )}

        {/* Restore Tab */}
        {activeTab === 'restore' && (
          <View style={styles.tabContent}>
            <Text style={styles.description}>
              Already purchased? Restore your subscription on this device.
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, isProcessing && styles.disabledButton]}
              onPress={handleRestore}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Restore Purchases</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Access Code Tab */}
        {activeTab === 'code' && (
          <View style={styles.tabContent}>
            <Text style={styles.description}>
              Purchased on our website? Enter your access code to unlock premium features.
            </Text>

            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                value={accessCode}
                onChangeText={setAccessCode}
                placeholder="XXXX-XXXX-XXXX"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={14}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!accessCode || isProcessing) && styles.disabledButton
              ]}
              onPress={handleCodeActivation}
              disabled={!accessCode || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Activate</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#888888',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    flex: 1,
  },
  dismissText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    color: '#757575',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  tabContent: {
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 15,
    textAlign: 'center',
  },
  planOptions: {
    marginBottom: 20,
  },
  planOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedPlan: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  planDetails: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 14,
    color: '#555555',
  },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#BBDEFB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  codeInputContainer: {
    marginBottom: 20,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SubscriptionModal;