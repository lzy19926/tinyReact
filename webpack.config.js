const path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let babelJSX = {
    loader: "babel-loader",
    options: {
        presets: ["@babel/preset-env", '@babel/preset-react']
    }
}


module.exports = {

    mode: 'none',//配置环境  生产模式不会压缩代码  利于调试

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
            //! loader开发测试用配置
            {
                test: /\.lzy$/,
                use: [
                    'babel-loader',
                    { loader: path.resolve(__dirname, './lzy-loader/index.js') }
                ]
            },

            //! babel 转JSX测试
            // {
            //     test: /\.lzy$/,
            //     use: [
            //         { loader: path.resolve(__dirname, './lzy-loader/index.js') },
            //         babelJSX
            //     ]
            // }
        ],
    },

}



