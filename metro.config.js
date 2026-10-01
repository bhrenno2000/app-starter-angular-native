const { getDefaultConfig } = require('expo/metro-config');
const { withAngularNative } = require('@ng-native/metro/config.cjs');
const { withTailwind } = require('@ng-native/tailwind/config.cjs');
const config = withAngularNative(getDefaultConfig(__dirname));
config.resolver.assetExts.push('htm');
module.exports = withTailwind(config, {
  input: './src/styles.css',
});
