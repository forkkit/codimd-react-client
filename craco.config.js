const CopyPlugin = require('copy-webpack-plugin');
const { when } = require('@craco/craco');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: {
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'node_modules/@hpcc-js/wasm/dist/graphvizlib.wasm', to: 'static/js' },
          { from: 'node_modules/@hpcc-js/wasm/dist/expatlib.wasm', to: 'static/js' },
          { from: 'node_modules/emojibase-data/en/data.json', to: 'static/js/emoji-data.json' }
        ],
      }),
      ...when(Boolean(process.env.ANALYZE), () => [
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          generateStatsFile: true
        })
      ], [])
    ],
  },
}
