const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/main.ts',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: [
      nodeExternals({ }),
  ],
  mode: 'production',
  node: {
      __dirname: false,
  },
  plugins: [
    new CopyPlugin([
        {
            from: 'env/default.prod.env',
            to: path.join(__dirname, '..', 'dist', 'env', 'default.env'),
        },
        {
            from: 'node_modules',
            to: path.join(__dirname, '..', 'dist', 'server', 'node_modules'),
        },
    ]),
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'main.js',
    path: path.join(__dirname, '..', 'dist', 'server'),
  },
  stats: 'minimal',
};