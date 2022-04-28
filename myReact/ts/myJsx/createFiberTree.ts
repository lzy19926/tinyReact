import { tplToVDOM } from "./tplToVnode";
import { global } from '../myHook/GlobalFiber'
import { FiberNode } from "../myHook/Interface";


//! 创建fiberNode树(Vnode树)
//! 深度优先遍历vnode树  包装成fiberNode
//! 根据fiberNode和FunctionComponent创建FiberNode 生成Fiber树
function createFiberTree(source: any, resources: any) {

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
        sourcePool: null,
        hookIndex: 0 // 用于记录hook的数量 以便查找
    }
    //todo 当前工作节点变为这个
    global.currentFiberNode = newFiberTree


    //todo 判断传入的source 转换成vnode
    let vnode = typeof source === 'string'
        ? tplToVDOM(source)
        : source

    //合并vnode和Fiber 挂载resource
    const { children = [], props, tag, text } = vnode
    newFiberTree.props = props
    newFiberTree.tag = tag
    newFiberTree.text = text
    newFiberTree.sourcePool = resources


    //TODO -----------如果tag大写 解析为组件 ----------------
    if (tag[0] === tag[0].toUpperCase()) {

        //todo 从sourcePool中获取子组件
        const fc = newFiberTree.sourcePool.components[tag]
        if (!fc) { console.error(`子组件${tag}未注册`) }

        //! 从资源池中拿取需要的props，给子函数组件绑定需要的props,并挂载子函数组件到fiber上
        handleFunctionComponentProps(newFiberTree, fc)

        //! 需要在这里执行fc 挂载hooks 生成新的resource
        const { template, data = {}, components = {} } = newFiberTree.stateNode()

        const resources = { data, components }

        // ! 渲染组件子fiber树 (sourcePool仅保存了父组件返回的数据)   
        const childFiber = createFiberTree(template, resources)
        newFiberTree.children = [childFiber]
    }

    //TODO ------------单fiber节点处理结束  更改flag
    newFiberTree.fiberFlags = 'update'

    //todo 如果有children 深度优先遍历  包装成fiberNode 挂到当前节点
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const childFiberTree = createFiberTree(children[i], newFiberTree.sourcePool)
            newFiberTree.children.push(childFiberTree)
        }
    }

    return newFiberTree
}


//! ---------------更新fiberTree-------------------
function updateFiberTree(source: any, fiber: FiberNode, resources: any) {

    //todo 判断传入的source 转换成vnode
    let vnode = typeof source === 'string'
        ? tplToVDOM(source)
        : source

    //todo 赋值当前正在工作的fiber节点
    const currentFiber = global.currentFiberNode = fiber

    //todo 合并vnode和当前fiber
    let { children = [], props, tag, text } = vnode
    currentFiber.props = props
    currentFiber.tag = tag
    currentFiber.text = text
    currentFiber.sourcePool = resources //挂载事件资源

    //TODO -----------如果tag大写 解析为组件 ----------------
    if (tag[0] == tag[0].toUpperCase()) {


        //todo 从sourcePool中获取子组件
        const fc = currentFiber.sourcePool.components[tag]

        //! 给子函数组件绑定需要的props
        //! (注意这里的props是上一个组件传递来的数据  上面的props是tag上的属性)
        handleFunctionComponentProps(currentFiber, fc)

        //! 需要在这里执行fc 挂载hooks
        const { template, data = {}, components = {} } = currentFiber.stateNode()
        const resources = { data, components }

        // ! 渲染组件子fiber树 挂载resources(需修改)
        currentFiber.sourcePool = resources
        const childVnode = tplToVDOM(template)
        children.unshift(childVnode)
    }

    //todo 如果有children 深度优先遍历  
    if (children) {
        for (let i = 0; i < children.length; i++) {
            //! 当map添加item时  可能造成vnode和childrenFiber数量不等
            //! 如果发现没有此fiber 就再根据vnode创建一个fiber
            const vnode = children[i]
            const resources = currentFiber.sourcePool
            const childFiber = currentFiber.children[i] || createFiberTree(vnode, resources)
            currentFiber.children[i] = updateFiberTree(vnode, childFiber, resources)
        }
    }

    return currentFiber
}


//! ------------从资源池中拿取子组件需要的Props 处理后传递给子组件----------
//! 返回处理好的子组件函数传递出去
function handleFunctionComponentProps(fiber, functionComponent) {
    const needProps = fiber.props
    const data = fiber.sourcePool.data
    const nextProps = {}

    for (let key in needProps) {

        let value = needProps[key][0]
        //! 对传入的props进行数据类型解析
        if (data[value]) { //从需求池中找到了对应的数据
            nextProps[key] = data[value]

        } else if (!isNaN((value - 0))) {//传入数字
            value = value - 0
            nextProps[key] = value

        } else if (value[0] === '"' || value[0] === "'") {    //传入字符串
            nextProps[key] = value.slice(1, value.length - 1).trim()

        } else {// 传入普通字符串
            nextProps[key] = value
        }

    }

    //给函数组件绑定props  挂载到fiber上
    const newFc = functionComponent.bind(null, nextProps)
    fiber.stateNode = newFc

    return newFc
}


export { createFiberTree, updateFiberTree }



// 错误记录
// 函数name被webpack打包后会变为bound+函数名
// 不能直接给tag赋值 