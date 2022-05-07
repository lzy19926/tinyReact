const useJSY = require('./useJSY')

function lzyLoader(source) {

    //todo 匹配获取<TEMPLATE></TEMPLATE>中的内容
    const templateEXP = /<TEMPLATE[^>]*>(?:.|[\r\n])*?<\/TEMPLATE>/g
    const templateArr = source.match(templateEXP)
    //todo 将<TEMPLATE>标签替换为<div> 
    const newOptionsArr = templateArr.map((tpl) => {
        const newTpl = tpl
            .replace('<TEMPLATE>', '`<div>')
            .replace('</TEMPLATE>', '</div>`')
        //todo 转换内部的模板为options对象
        return useJSY(newTpl)
    })

    //todo 将所有的template标签字符替换成options对象
    //todo 一个标签内字符对应一个options对象
    let newSource = source
    for (let i = 0; i < templateArr.length; i++) {
        newSource = newSource.replace(templateArr[0], newOptionsArr[0])
    }

    //todo 将新的js字符串返回  交给babel转换为js代码
    return `${newSource}`
}



module.exports = lzyLoader



//!------ 转换<TEMPLATE/>模板为options对象:---------
// const options = `{
//     components:{ Demo },
//     data: ${needData},
//     template:'<div><Demo id={1}></Demo></div>',
// }`;