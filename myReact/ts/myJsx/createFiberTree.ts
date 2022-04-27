import { tplToVDOM } from "./tplToVnode";
import { global } from '../myHook/GlobalFiber'
import { FiberNode } from "../myHook/Interface";
import { commitPart, render } from '../myHook/render'


//! 创建fiberNode树(Vnode树)
//! 深度优先遍历vnode树  包装成fiberNode
//! 根据fiberNode和FunctionComponent创建FiberNode 生成Fiber树
function createFiberTree(source: any) {

    //todo 创建一个新的fiber节点 
    let newFiberTree: FiberNode = {
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
    global.currentFiberNode = newFiberTree


    //todo 解析vnode  如果传入vnode直接执行  否则执行fc
    let vnode = null
    //1 传入组件时 先解析为vnode 否则是直接传入vnode
    if (typeof source === 'string') {
        const htmlStr = source
        vnode = tplToVDOM(htmlStr)
    } else {
        vnode = source
    }

    //合并vnode和Fiber
    const { children = [], props, tag, text } = vnode
    newFiberTree.props = props
    newFiberTree.tag = tag
    newFiberTree.text = text


    //TODO -----------如果tag大写 解析为组件(此时无children) ----------------
    if (tag[0] === tag[0].toUpperCase()) {
        //! 挂载props
        // window['$$' + tag] = window['$$' + tag].bind(null, props)
        // newFiberNode.stateNode = fc.bind(null, props)
        //! 注意 需要在这里执行fn 挂载hooks
        //todo commit当前组件  重新render下一个组件


        // const container = newFiberTree.ref || document.getElementById('root')
        // commitPart(newFiberTree, container)


        // const fc = window['$$' + tag]
        // const htmlStr = fc()

        // render(htmlStr, container)
        // return newFiberTree

        const fc = window['$$' + tag]
        const htmlStr = fc()
        const childFiber = createFiberTree(htmlStr)
        newFiberTree.children = [childFiber]
    }

    //TODO ------------单fiber节点处理结束  更改flag
    newFiberTree.fiberFlags = 'update'


    //todo 如果有children 深度优先遍历  包装成fiberNode 挂到当前节点
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const vnode = children[i]
            newFiberTree.children.push(createFiberTree(vnode))
        }
    }

    return newFiberTree
}




//! ---------------更新fiberTree-------------------
function updateFiberTree(source: any, fiber: FiberNode) {
    //todo 解析vnode  如果传入vnode直接执行  否则执行fc
    let vnode = null
    //1 更新组件时 先解析为vnode 否则是直接传入vnode
    if (typeof source === 'string') {
        const htmlStr = source
        vnode = tplToVDOM(htmlStr)
    } else {
        vnode = source
    }

    const currentFiber = fiber

    //todo 合并vnode和当前fiber
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
            currentFiber.children[i] = updateFiberTree(vnode, childFiber)
        }
    }

    return currentFiber

}




export { createFiberTree, updateFiberTree }