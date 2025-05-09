// src/data/inMemoryProvider.js
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

// Directory for data files
const dataDir = path.join(__dirname, '..', '..', 'data');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
};

// Save data to a JSON file
const saveData = async (filename, data) => {
  await ensureDataDir();
  const filePath = path.join(dataDir, `${filename}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Load data from a JSON file
const loadData = async (filename, defaultData = []) => {
  await ensureDataDir();
  const filePath = path.join(dataDir, `${filename}.json`);
  
  try {
    const fileData = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileData);
  } catch (err) {
    // If file doesn't exist or is invalid, return default data
    if (err.code === 'ENOENT' || err instanceof SyntaxError) {
      await saveData(filename, defaultData); // Create the file with default data
      return defaultData;
    }
    throw err;
  }
};

// In-memory storage with file persistence
let users = [];
let subscriptions = [];
let nextUserId = 1;

// Initialize data
const initData = async () => {
  users = await loadData('users', []);
  subscriptions = await loadData('subscriptions', []);
  
  // Set nextUserId to be one more than the maximum id
  nextUserId = users.length > 0 
    ? Math.max(...users.map(user => user.id)) + 1 
    : 1;
};

// Initialize on module load
initData();

// User methods
const userMethods = {
  async findById(id) {
    return users.find(user => user.id === parseInt(id)) || null;
  },
  
  async findByEmail(email) {
    return users.find(user => user.email === email) || null;
  },
  
  async create(userData) {
    // Check if user exists
    if (await this.findByEmail(userData.email)) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create user
    const newUser = {
      id: nextUserId++,
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(newUser);
    
    // Save to file
    await saveData('users', users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
  
  async update(id, updates) {
    const index = users.findIndex(user => user.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    // Update fields
    users[index] = { ...users[index], ...updates };
    
    // Save to file
    await saveData('users', users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  },
  
  async changePassword(id, newPassword) {
    const index = users.findIndex(user => user.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    users[index].password = hashedPassword;
    
    // Save to file
    await saveData('users', users);
    
    return true;
  },
  
  async comparePassword(userId, candidatePassword) {
    const user = await this.findById(userId);
    if (!user) return false;
    
    return bcrypt.compare(candidatePassword, user.password);
  }
};

// Subscription methods
const subscriptionMethods = {
  async findByUserId(userId) {
    return subscriptions.find(sub => sub.userId === parseInt(userId)) || null;
  },
  
  async create(subscriptionData) {
    const subscription = {
      id: Date.now().toString(),
      userId: parseInt(subscriptionData.userId),
      plan: subscriptionData.plan,
      startDate: subscriptionData.startDate || new Date(),
      endDate: subscriptionData.endDate,
      status: 'active',
      features: this.getFeaturesForPlan(subscriptionData.plan)
    };
    
    subscriptions.push(subscription);
    
    // Save to file
    await saveData('subscriptions', subscriptions);
    
    return subscription;
  },
  
  async update(id, updates) {
    const index = subscriptions.findIndex(sub => sub.id === id);
    
    if (index === -1) {
      return null;
    }
    
    subscriptions[index] = { ...subscriptions[index], ...updates };
    
    // Save to file
    await saveData('subscriptions', subscriptions);
    
    return subscriptions[index];
  },
  
  async cancel(id) {
    const index = subscriptions.findIndex(sub => sub.id === id);
    
    if (index === -1) {
      return false;
    }
    
    subscriptions[index].status = 'cancelled';
    
    // Save to file
    await saveData('subscriptions', subscriptions);
    
    return true;
  },
  
  getFeaturesForPlan(plan) {
    switch (plan) {
      case 'free':
        return {
          dealAlerts: 3,
          destinations: 2,
          customAlerts: false,
          adFree: false
        };
      case 'monthly':
      case 'yearly':
      case 'premium':
        return {
          dealAlerts: -1, // unlimited
          destinations: -1, // unlimited
          customAlerts: true,
          adFree: true
        };
      default:
        return {
          dealAlerts: 0,
          destinations: 0,
          customAlerts: false,
          adFree: false
        };
    }
  }
};

module.exports = {
  user: userMethods,
  subscription: subscriptionMethods
};