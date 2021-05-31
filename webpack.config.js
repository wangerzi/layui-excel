const path = require('path');

module.exports = {
  mode: 'production',
  entry: ['babel-polyfill', './src/excel.js'],
  output: {
    path: path.resolve(__dirname, 'layui_exts'),
    filename: 'excel.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test:/\.js$/,
        exclude:/(node_modules|bower_components)/,//排除掉node_module目录
        use:{
          loader:'babel-loader',
          options:{
            presets:['env'] //转码规则
          }
        }
      }
    ]
  },
  performance: {
    maxAssetSize: 1024000000,
    maxEntrypointSize: 1024000000,
    assetFilter: function (assetFilename) {
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  }
}
