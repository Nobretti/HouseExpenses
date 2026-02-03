module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
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
