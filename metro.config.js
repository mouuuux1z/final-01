const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const mobileRoot = path.resolve(projectRoot, 'mobile');
const rootModules = path.resolve(projectRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [mobileRoot];

// Use a single node_modules tree to avoid duplicate React (useContext crash on web).
config.resolver.nodeModulesPaths = [rootModules];
config.resolver.disableHierarchicalLookup = true;
config.resolver.extraNodeModules = {
  react: path.join(rootModules, 'react'),
  'react-dom': path.join(rootModules, 'react-dom'),
  'react-native': path.join(rootModules, 'react-native'),
  'react-native-web': path.join(rootModules, 'react-native-web'),
};

module.exports = withNativeWind(config, { input: './mobile/global.css' });
