const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin')

const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  // エントリポイントのファイル
  entry: './src/index.js',
  mode: 'development',
  output: {
    // 出力先のディレクトリ
    path: path.join(__dirname, './dest'),
    // 出力ファイル名
    filename: 'bundle.js',
  },
  devServer: {
    // webpackの扱わないファイル(HTMLや画像など)が入っているディレクトリ
    contentBase: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.vue$/, // ファイルが.vueで終われば...
        loader: 'vue-loader', // vue-loaderを使う
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader',
      },
      {
        test: /\.scss$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader'], // css-loader -> vue-style-loaderの順で通していく
      },
    ],
  },
  resolve: {
    // import './foo.vue' の代わりに import './foo' と書けるようになる(拡張子省略)
    extensions: ['.js', '.vue'],
    alias: {
      // vue-template-compilerに読ませてコンパイルするために必要
      vue$: 'vue/dist/vue.esm.js',
    },
  },
  plugins: [new VueLoaderPlugin(), new StyleLintPlugin({
    files: ['src/**/*.{vue,css,scss}'],
  })],
};
