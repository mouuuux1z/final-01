const {
  withAndroidManifest,
  AndroidConfig,
} = require('@expo/config-plugins');

/** Allow HTTP API calls (VPS IP) in release APK builds on EAS. */
function withAndroidCleartext(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app.$['android:usesCleartextTraffic'] = 'true';
    return config;
  });
}

module.exports = withAndroidCleartext;
