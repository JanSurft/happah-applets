var path = require('path')

module.exports = {
     entry: './main.js',
     output: {
          path: './bin',
          filename: 'precision.js',
          publicPath: '/bin/',
     },
     module: {
          loaders: [{
               test: /\.js$/,
               exclude: /node_modules/,
               loader: 'babel-loader',
          }, {
               test: /\.yaml$/,
               exclude: /node_modules/,
               loader: 'yaml-loader',
          }, {
               test: /\.json$/,
               exclude: /node_modules/,
               loader: 'json-loader',
          }, {
               test: /\.coffee$/,
               loader: "coffee-loader",
          }, {
               test: /\.(coffee\.md|litcoffee)$/,
               loader: "coffee-loader?literate",
          }],
     },
     node: {
          fs: "empty",
          child_process: "empty",
     }
}
