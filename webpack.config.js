//////////////////////////////////////////////////////////////////////////////
//
// @author Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

module.exports = {
     context: __dirname + "/js/[name]",
     entry: {
          "a-frame": __dirname + "/js/a-frame/main.js",
          "bernstein-polynomials": __dirname + "/js/bernstein-polynomials/main.js",
          "continous-subdivision": __dirname + "/js/continous-subdivision/main.js",
          "de-casteljau": __dirname + "/js/de-casteljau/main.js",
          "functional-decasteljau": __dirname + "/js/functional-decasteljau/main.js",
          "generalized-decasteljau": __dirname + "/js/generalized-decasteljau/main.js",
          "lerp": __dirname + "/js/lerp/main.js",
          "precision": __dirname + "/js/precision/main.js",
          "hodograph": __dirname + "/js/hodograph/main.js",
     },
     output: {
          path: './bin',
          filename: '[name].js',
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
     },
}
