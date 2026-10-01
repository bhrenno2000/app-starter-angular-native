// Use one Metro development bundle; Angular feature routes remain lazy.
process.env.EXPO_NO_METRO_LAZY ??= '1';
const { getDefaultConfig } = require('expo/metro-config');
const { withAngularNative } = require('@ng-native/metro/config.cjs');
const { withTailwind } = require('@ng-native/tailwind/config.cjs');
const config = withAngularNative(getDefaultConfig(__dirname));
config.resolver.assetExts.push('htm');
module.exports = withTailwind(config, {
  input: './src/styles.css',
});
