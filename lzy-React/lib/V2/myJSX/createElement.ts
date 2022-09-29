// 判断是否为Element
function isElement(node: any) {
    if (!node.$$typeof) return false
    return Symbol.keyFor(node.$$typeof) === 'lzyElement'
}

// 通过解析来的JSX创建Element树
export function createElement(...args: any[]) {
    let key;
    let ref;
    let children = [];
    const tag = args[0]
    const config = args[1]
    const childNodes = args.slice(2)


    // 处理tag为函数组件的情况(创建组件Element  执行函数并返回ElementNode)
    if (typeof tag === 'function') {
        let fc = tag
        return {
            $$typeof: Symbol.for('lzyElement'),
            tag: fc.name,
            ref: fc,
            key,
            props: config,
            children: [fc()],
            fiber: undefined
        }
    }

    // 单独处理ref和key
    if (config) {
        ref = config.ref
        key = config.key
        // 删除属性
        delete config?.ref
        delete config?.key
    }

    // 遍历处理childrenNode
    if (childNodes.length > 0) {
        childNodes.forEach((child) => {
            if (isElement(child)) {
                children.push(child)
            } else {
                children.push({
                    $$typeof: Symbol.for('lzyElement'),
                    tag: 'text',
                    text: child,
                    fiber: undefined
                })
            }
        })
    }

    //返回生成的虚拟dom
    return {
        $$typeof: Symbol.for('lzyElement'),
        tag,
        ref,
        key,
        props: config,
        children,
        fiber: undefined
    }
}


// 测试函数
const test = () => {

    function App() {
        return /*#__PURE__*/createElement("div", null, "123",
        /*#__PURE__*/createElement("div", {
            id: 1
        }, "1")
            , /*#__PURE__*/createElement("div", {
                id: 1
            }, "1"));
    }

    const res = App()
    console.log(res);
}




