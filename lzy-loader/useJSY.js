
const Scanner = require('./tplScanner')

//todo 传入模板  将标签内需要使用的属性和方法解析出来  放到data里
function useJSY(template) {

    const scanner = new Scanner(template);
    const tokens = []
    const componentsArr = []
    //反复扫描并处理<>开始标签中的内容
    while (!scanner.eos()) {
        const word = scanner.scanUntil('>');
        scanner.scan('>');

        if (word.startsWith('<') && !word.startsWith('</')) {
            //todo 处理开始标签内文字
            tokens.push(word)
            //todo 拆离开始标签内Tag(大写组件) 如果是大写tag就推入数组
            const tag = word.split(' ')[0].slice(1)
            if (tag[0] === tag[0].toUpperCase()) {
                componentsArr.push(tag)
            }
        }
        if (!word) continue;
    }



    //todo 对标签中的{}内容进行解析  找到则推入dataStr(以字符串的形式拼接)
    let needDataStr = ''
    const propEXP = /({[\s\S]*?})/g
    tokens.forEach(token => {
        //使用set数组去重
        const propArr = [...new Set(token.match(propEXP))];
        //todo 将所有匹配项拼接起来 删去{ }
        if (propArr) {
            propArr.forEach(prop => {
                const key = prop.replace('{', '').replace('}', '')
                const kvStr = `${key}:${key},`
                needDataStr += kvStr
            })
        }
    })

    //todo 将组件数组转化为键值对
    let needComponentsStr = ''
    //set数组去重
    const newComponentsArr = [...new Set(componentsArr)];

    newComponentsArr.forEach((key) => {
        const kvStr = `${key}:${key},`
        needComponentsStr += kvStr
    })


    //todo  最终获得的needData和components 再包一层{}
    // {name:name, handleClick:handleClick, 1:1,} , {Demo:Demo,Test:Test} 
    const needData = `{${needDataStr}}`
    const needComponents = `{${needComponentsStr}}`

    console.log(needComponents);

    //todo 将转换完的options对象返回
    const options = `{
            components:${needComponents},
            data: ${needData},
            template:${template},
        }`

    return options
}



module.exports = useJSY