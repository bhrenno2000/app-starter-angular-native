const { withInfoPlist } = require('expo/config-plugins');
module.exports = function withApplicationStatusBar(config) {
  return withInfoPlist(config, (mod) => {
    mod.modResults.UIViewControllerBasedStatusBarAppearance = false;
    return mod;
  });
};
