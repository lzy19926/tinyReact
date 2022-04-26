import { tplToVDOM } from "./tplToVnode";
import { fiber, global } from '../myHook/GlobalFiber'
import { FiberNode } from "../myHook/Interface";



//! 创建fiberNode树(Vnode树)
//! 深度优先遍历vnode树  包装成fiberNode
//! 根据fiberNode和FunctionComponent创建FiberNode 生成Fiber树
function createFiberTree(source: any) {

    //todo 创建一个新的fiber节点 
    let newFiberNode: FiberNode = {
        memorizedState: null,// fiber上的所有hook链表(正在执行的hook会进入workInProgressHook)
        stateNode: () => { },    // 对应的函数组件
        updateQueue: null, // Effects的更新链表
        fiberFlags: 'mount',// fiber的生命周期 判断是否初始化
        hasRef: false,//ref相关tag
        ref: null,
        children: [],
        props: null,
        tag: null,
        text: null,
        hookIndex: 0 // 用于记录hook的数量 以便查找
    }
    //todo 当前工作节点变为这个
    global.currentFiberNode = newFiberNode


    //todo 解析vnode  如果传入vnode直接执行  否则执行fc
    let vnode = null
    //1 传入组件时 先解析为vnode 否则是直接传入vnode
    if (typeof source === 'function') {
        const htmlStr = source()
        vnode = tplToVDOM(htmlStr)
    } else {
        vnode = source
    }


    //合并vnode和Fiber
    const { children = [], props, tag, text } = vnode
    newFiberNode.props = props
    newFiberNode.tag = tag
    newFiberNode.text = text


    //TODO -----------如果tag大写 解析为组件(此时无children) ----------------
    if (tag[0] === tag[0].toUpperCase()) {
        const fc = window['$$' + tag]
        newFiberNode.stateNode = fc//! 注意 需要在这里执行fn 挂载hooks
        const htmlStr = fc()
        const vnode = tplToVDOM(htmlStr)
        const childFiber = createFiberTree(vnode)
        newFiberNode.children = [childFiber]
    }

    //TODO ------------单fiber节点处理结束  更改flag
    newFiberNode.fiberFlags = 'update'


    //todo 如果有children 深度优先遍历  包装成fiberNode 挂到当前节点
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const vnode = children[i]
            newFiberNode.children.push(createFiberTree(vnode))
        }
    }


    return newFiberNode
}




//! ---------------更新fiberTree-------------------
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
            const childFiber = currentFiber.children[i] || createFiberTree(vnode)
            currentFiber.children[i] = updateFiberNode(vnode, childFiber)
        }
    }

    return currentFiber
}

export { createFiberTree, updateFiberTree }