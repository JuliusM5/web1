// src/webpack.config.js
const path = require('path');

module.exports = {
  // ... your existing webpack config
  
  resolve: {
    fallback: {
      // Provide polyfills for Node.js core modules
      "path": require.resolve("path-browserify"),
      "fs": false,
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "url": require.resolve("url/")
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  plugins: [
    // ... your existing plugins
    
    // Add ProvidePlugin to automatically provide Buffer
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ]
};