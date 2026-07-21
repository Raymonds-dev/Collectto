module.exports = function (api) {
  api.cache(true);
  const plugins = [];

  // 1. Remove os consoles apenas na versão final de produção
  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }

  // 2. O plugin de Worklets/Reanimated deve ficar no FINAL do array
  plugins.push('react-native-worklets/plugin');

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins,
  };
};