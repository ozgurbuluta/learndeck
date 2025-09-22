const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..'); // monorepo root

const config = getDefaultConfig(projectRoot);

// Enable pnpm symlink support and watch the monorepo root
config.unstable_enableSymlinks = true;
config.watchFolders = Array.from(new Set([...(config.watchFolders || []), workspaceRoot]));

module.exports = config;
