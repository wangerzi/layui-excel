const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/excel.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'excel.js',
  },
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
}
