// webpack.config.js
const webpack = require('webpack');
const path = require('path');

module.exports = {
  // Maintain your existing webpack config if you have one
  // This just adds the necessary polyfills for Axios
  
  resolve: {
    alias: {
    'react-native$': 'react-native-web',
    '@react-native-async-storage/async-storage': 'localforage',
    // Add more aliases as needed
    },
    fallback: {
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "util": require.resolve("util/"),
      "zlib": require.resolve("browserify-zlib"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url/"),
      "assert": require.resolve("assert/"),
      'fs': false,
      'path': require.resolve('path-browserify'),
    }
  },
  plugins: [
    // Add any existing plugins here
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ]
};