module.exports = {
     entry: './js/precision.js',
     output: {
          path: './bin',
          filename: 'precision.js',
     },
     module: {
          preLoaders: [{
               test: /\.json$/,
               exclude: /node-modules/,
               loader: 'json-loader',
          }, {
               test: /\.coffee$/,
               loader: 'coffee-hint-loader',
          }],
          loaders: [{
               test: /\.js$/,
               exclude: /node_modules/,
               loader: 'babel-loader',
          }, {
               test: /\.json$/,
               exclude: /node_modules/,
               loader: 'json-loader',
          }, {
               test: /\.coffee$/,
               loader: 'coffee-loader',
          }]
     },
     node: {
          fs: "empty",
          child_process: "empty",
     }
}
