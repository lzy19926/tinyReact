import { tplToVDOM } from "./tplToVnode";

//! 创建fiberNode树(Vnode树)
//! 深度优先遍历vnode树  包装成fiberNode
function creatFiberNode(vnode: any) {

    //todo 从vnode中解构出需要的值
    let { children = [], props, tag, text } = vnode

    const fiberNode = {
        memorizedState: null,// fiber上的所有hook链表(正在执行的hook会进入workInProgressHook)
        stateNode: () => { },    // 对应的函数组件
        updateQueue: null,  // Effects的更新链表
        fiberFlags: 'mount',// fiber的生命周期tag 判断是否初始化
        hasRef: false,//ref相关tag
        ref: null,
        children,
        props,
        tag,
        text,
    }



    //TODO -----------如果tag大写 解析为组件(此时无children) ----------------
    //todo 生成子vnodeTree挂载到cihldren上
    if (tag[tag.length - 1] == '/') {
        tag = tag.slice(0, tag.length - 1)
        fiberNode.tag = tag
    }

    if (tag[0] == tag[0].toUpperCase()) {
        fiberNode.stateNode = window['$$' + tag]
        const html: any = fiberNode.stateNode()
        const childVnode = tplToVDOM(html)
        children.unshift(childVnode)
    }

    //todo 如果有children 深度优先遍历  包装成fiberNode
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const vnode = children[i]
            fiberNode.children[i] = creatFiberNode(vnode)
        }
    }


    return fiberNode
}


function createFiberTree(htmlTplStr: string) {
    const vnode = tplToVDOM(htmlTplStr)
    const fiberTree = creatFiberNode(vnode)
    return fiberTree
}

export { createFiberTree }