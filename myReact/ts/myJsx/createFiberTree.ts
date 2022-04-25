import { tplToVDOM } from "./tplToVnode";
import { fiber, global } from '../myHook/GlobalFiber'



//! 创建fiberNode树(Vnode树)
//! 深度优先遍历vnode树  包装成fiberNode
function creatFiberNode(vnode: any) {

    //todo 从vnode中解构出需要的值
    let { children = [], props, tag, text } = vnode

    //todo 创建新fiberNode
    const fiberNode = {
        memorizedState: null,// fiber上的所有hook链表(正在执行的hook会进入workInProgressHook)
        stateNode: () => { },    // 对应的函数组件
        updateQueue: null,  // Effects的更新链表
        fiberFlags: global.renderTag === 'mount' ? 'mount' : 'update',// fiber的生命周期tag 判断是否初始化
        hasRef: false,//ref相关tag
        ref: null,
        children,
        props,
        tag,
        text,
        hookIndex: 0
    }
    //todo 当前正在工作的fiber节点
    global.currentFiberNode = fiberNode

    //解析单标签  暂定
    if (tag[tag.length - 1] == '/') {
        tag = tag.slice(0, tag.length - 1)
        fiberNode.tag = tag
    }

    //TODO -----------如果tag大写 解析为组件(此时无children) ----------------
    if (tag[0] == tag[0].toUpperCase()) {
        fiberNode.stateNode = window['$$' + tag]
        const html: any = fiberNode.stateNode()
        const childVnode = tplToVDOM(html)
        children.unshift(childVnode)
    }

    //TODO ------------单fiber节点处理结束  更改flag
    fiberNode.fiberFlags = 'update'

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


//! 更新fiberTree

function updateFiberTree(htmlTplStr: string) {
    //! 因为之前创建了app外层 这里从fiber.children[0]开始更新
    const vnode = tplToVDOM(htmlTplStr)
    const fiberTree = updateFiberNode(vnode, fiber.children[0])
    return fiberTree
}


function updateFiberNode(vnode: any, fiber: any) {

    const currentFiber = fiber
    //todo 从vnode中解构出需要的值
    let { children = [], props, tag, text } = vnode

    currentFiber.props = props
    currentFiber.tag = tag
    currentFiber.text = text

    //todo 当前正在工作的fiber节点
    global.currentFiberNode = currentFiber

    //TODO -----------如果tag大写 解析为组件 生成html(此时无children) ----------------
    if (tag[0] == tag[0].toUpperCase()) {
        currentFiber.stateNode = window['$$' + tag]
        const html: any = currentFiber.stateNode()
        const childVnode = tplToVDOM(html)
        children.unshift(childVnode)
    }
    //todo 如果有children 深度优先遍历  

    if (children) {
        for (let i = 0; i < children.length; i++) {
            const vnode = children[i]
            //! 当map添加item时  可能造成vnode和childrenFiber数量不等
            //! 如果发现没有此fiber 就再根据vnode创建一个fiber
            const childFiber = currentFiber.children[i] || creatFiberNode(vnode)
            currentFiber.children[i] = updateFiberNode(vnode, childFiber)
        }
    }

    return currentFiber
}

export { createFiberTree, updateFiberTree }