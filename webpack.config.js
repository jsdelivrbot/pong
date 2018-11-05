var path = require('path');
var nodeExternals = require('webpack-node-externals');
var HtmlWebpackPlugin = require('html-webpack-plugin');

// we have two separate webpack files because the Node.js has its own `require` module,
// meaning it doesn't require external `node_modules`
// but the web browser needs those external modules since it has nothing
const serverPath = path.resolve(__dirname, './server/');
module.exports.serverConfig = {
  mode: 'development',
  target: 'node',
  entry: './server/server.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'server.js'
  },
  resolve: {
    alias: {
      managers: path.resolve(serverPath, 'js/managers'),
    }
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
};

const appPath = path.resolve(__dirname, './public/');
module.exports.webConfig = {
  mode: 'development',
  target: 'web',
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.js'
  },
  resolve: {
    alias: {
      components: path.resolve(appPath, 'js/components'),
      managers: path.resolve(appPath, 'js/managers'),
    }
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    })
  ],
};
