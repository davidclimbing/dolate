const { createExpoWebpackConfigAsync } = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@supabase/supabase-js'],
    },
  }, argv);

  // Add fallbacks for Node.js built-ins
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('react-native-crypto'),
    stream: require.resolve('readable-stream'),
    http: false,
    https: false,
    os: false,
    url: require.resolve('react-native-url-polyfill'),
    zlib: false,
    fs: false,
    path: false,
    'node:sqlite': false,
    'node:stream': require.resolve('readable-stream'),
    'node:crypto': require.resolve('react-native-crypto'),
    'node:fs': false,
    'node:path': false,
    'node:url': require.resolve('react-native-url-polyfill'),
    'node:http': false,
    'node:https': false,
    'node:os': false,
    'node:zlib': false,
  };

  // Exclude problematic modules from being bundled
  config.module.rules.push({
    test: /node_modules\/.*undici.*\/lib\/cache\/sqlite-cache-store\.js$/,
    loader: 'null-loader',
  });

  // Also exclude the entire cache directory from undici
  config.module.rules.push({
    test: /node_modules\/.*undici.*\/lib\/cache\/.*\.js$/,
    loader: 'null-loader',
  });

  return config;
};