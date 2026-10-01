const { withInfoPlist } = require('expo/config-plugins');

// Register first so this mod runs after Angular Native's controller-based default.
module.exports = function withApplicationStatusBar(config) {
  return withInfoPlist(config, (mod) => {
    mod.modResults.UIViewControllerBasedStatusBarAppearance = false;
    return mod;
  });
};
