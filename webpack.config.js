const path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


module.exports = {
    mode: 'none',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    //开启devServer配置
    devServer: {
        static: { //devServer的静态资源读取路径  
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8005,
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
        }),

    ],

    //配置CSS模块化  --可以引入和打包CSS文件(使用普通css文件  如需使用less需要其他配置)
    //所有的.css文件都要经过css-loader的解析
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            //! lzy-loader开发测试用配置(v1)
            // {
            //     test: /\.lzy$/,
            //     use: [
            //         'babel-loader',
            //         { loader: path.resolve(__dirname, './lzy-loader/index2.js') }
            //     ]
            // },
            //! lzy-loader开发测试用配置(v2)
            {
                test: /\.lzy$/,
                use: [
                    'babel-loader',
                    { loader: path.resolve(__dirname, './my_node_modules/lzy-loader/index') }
                ]
            },
        ],
    },

}



