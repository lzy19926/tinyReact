const path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");



module.exports = {

    mode: 'development',//配置环境  生产模式不会压缩代码  利于调试

    entry: './src/index.js',
    
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    //开启devServer配置
    devServer: {
        //devServer的静态资源读取路径  
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8000,
    },


    plugins: [
        //用于打包时生成html文件  自动引入bundle.js  如果配置了css也会自动引入
        new HtmlWebpackPlugin({
            title: 'LZY App',
            template: 'index.html'
        }),
        //用于支持css引入 打包时会将所有css打包到一起 (搭配htmlPlugin)
        new MiniCssExtractPlugin(),
        //配置全局引入的包
        new Webpack.ProvidePlugin({
            '$': 'jquery',
            jQuery: "jquery",
        })
    ],

    //配置CSS模块化  --可以引入和打包CSS文件(使用普通css文件  如需使用less需要其他配置)
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            }
        ],
    },


    //配置CDN引入----
    // externalsType: 'script',
    // externals: {

    // },
}


