

//! ------------------说明-----------------------
//! 将以下写法转换成options配置项写法
// function A() {
//     const id = 1
//     return useJSY(<div id={ id } > </div>)
// }


//! 转换后的写法
function A0() {
    const id = 1
    return {
        data: { id },
        template: `<div id={id}></div>`

    }
}


import Scanner from "./tplScanner";





//todo 传入模板  将标签内需要使用的属性和方法解析出来  放到data里
function useJSY(template) {

    console.log(template);

    const scanner = new Scanner(template);
    const tokens = []

    //反复扫描并处理<>开始标签中的内容
    while (!scanner.eos()) {
        const word = scanner.scanUntil('>');
        scanner.scan('>');

        if (word.startsWith('<') && !word.startsWith('</')) {
            tokens.push(word)
        }

        if (!word) continue;
    }



    //todo 对标签中的{}内容进行解析  找到则推入dataStr(以字符串的形式拼接)
    let needDataStr = ''
    const propEXP = /({[\s\S]*?})/g
    tokens.forEach(token => {
        const prop = token.match(propEXP)
        //todo 将所有匹配项拼接起来 删去{ }
        if (prop) {

            prop.forEach(prop => {
                const key = prop.replace('{', '').replace('}', '')
                const kvStr = `${key}:${key},`
                needDataStr += kvStr
            })
        }
    })
    //todo  最终获得的needData 再包一层{}
    // {name:name, handleClick:handleClick, 1:1,}
    const needData = `{${needDataStr}}`


    //todo 将转换完的options对象返回
    const options = `{
            components:{ Demo },
            data: ${needData},
            template:'<div><Demo id={1}></Demo></div>',
        }`




    return options
}

export default useJSY