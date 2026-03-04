module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Replaces inline Babel helpers (including Promise wrappers) with
      // explicit imports from @babel/runtime, eliminating the Hermes
      // "Promise was not declared in promiseMethodWrapper" warning.
      ['@babel/plugin-transform-runtime', { helpers: true, regenerator: false }],
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@store': './src/store',
            '@hooks': './src/hooks',
            '@types': './src/types',
            '@constants': './src/constants',
            '@utils': './src/utils',
            '@navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
