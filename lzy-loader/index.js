
const jsx = require("@babel/core")

function replaceAll(string, s1, s2) {
    return string.replace(new RegExp(s1, "gm"), s2)
}



function lzyLoader(source) {
    console.log('获得的资源', source);

    //todo 将所有<LZY-TEMPLATE>标签替换为div标签
    const newSource = source
        .replace(/<LZY-TEMPLATE>/g, '<div>')
        .replace(/<\/LZY-TEMPLATE>/g, '</div>')

    const { code } = jsx.transformSync(newSource, {
        presets: ["@babel/preset-react"],
    });

    //todo 将React.createElement替换为自己的createElement函数(最好替换为AST操作)
    const newCode = code.replace(/React.createElement/g, 'LzyReact.createElement')

    console.log(newCode);


    //todo 将新的js字符串返回  交给babel转换为js代码
    return `${newCode}`
}





module.exports = lzyLoader



