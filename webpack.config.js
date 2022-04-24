const path = require('path');

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
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 8000,
    },
}
