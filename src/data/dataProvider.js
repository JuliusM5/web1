// src/data/dataProvider.js

import inMemoryProvider from './inMemoryProvider';

// Determine which provider to use based on environment variable
// In a browser environment, we need to check window or use a build flag


// Export the appropriate data provider
const dataProvider = inMemoryProvider;

console.log('Using in-memory data provider');

export default dataProvider;