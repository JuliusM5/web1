const bcrypt = require('bcryptjs');

// In-memory user storage
const users = [];
let nextId = 1;

class User {
  static async create(userData) {
    // Check if user exists
    if (users.find(user => user.email === userData.email)) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create user
    const newUser = {
      id: nextId++,
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(newUser);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
  
  static async findByEmail(email) {
    return users.find(user => user.email === email);
  }
  
  static async findById(id) {
    return users.find(user => user.id === parseInt(id));
  }
  
  static async comparePassword(user, candidatePassword) {
    return await bcrypt.compare(candidatePassword, user.password);
  }
  
  static async updateUser(id, updates) {
    const index = users.findIndex(user => user.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    // Update fields
    users[index] = { ...users[index], ...updates };
    
    // Return user without password
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  }
  
  static async updatePassword(id, newPassword) {
    const index = users.findIndex(user => user.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    users[index].password = hashedPassword;
    
    return true;
  }
}

module.exports = User;