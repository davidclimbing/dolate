const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for web compatibility
config.resolver = {
  ...config.resolver,
  alias: {
    // Polyfill Node.js built-ins for web
    crypto: 'react-native-crypto',
    stream: 'readable-stream',
    http: false,
    https: false,
    os: false,
    url: 'react-native-url-polyfill',
    zlib: false,
    fs: false,
    path: false,
    // Block node: prefixed modules
    'node:sqlite': false,
    'node:stream': 'readable-stream',
    'node:crypto': 'react-native-crypto',
    'node:fs': false,
    'node:path': false,
    'node:url': 'react-native-url-polyfill',
    'node:http': false,
    'node:https': false,
    'node:os': false,
    'node:zlib': false,
  },
  platforms: ['ios', 'android', 'native', 'web'],
  resolverMainFields: ['react-native', 'browser', 'main'],
  // Remove blockList since we've replaced the file with a stub
};

// Configure for web platform
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Exclude Node.js built-ins from bundling
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;