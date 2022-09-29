
import { FiberNode, global } from '../myReactCore/GlobalFiber'
import { ElementNode, TextElementNode } from '../myReactCore/Interface'
import { transformElementTreeToBinadyTree } from '../myJSX/createElement'
//! ---------------更新fiberTree 遍历wk树 (在这里生成第二棵fiberTree)-------------------
function updateFiberTree(
    newElementNode: ElementNode | TextElementNode,
    workInProgressFiber: FiberNode,
    currentFiber: FiberNode) {

    //todo 添加节点逻辑
    if (!currentFiber) {
        // const placementFiber = createFiberTree()
        // return placementFiber
    }

    //todo 删除节点逻辑
    if (!newElementNode) {
        console.log('无此节点', newElementNode, workInProgressFiber, currentFiber);
    }

    // 如果没有  生成一个alternate链接上去 
    if (!workInProgressFiber) {
        workInProgressFiber = createAlternate(currentFiber)
    }


    //todo 链接element和节点
    let childElement = newElementNode._child
    let siblingElement = newElementNode._sibling
    currentFiber._element = newElementNode
    workInProgressFiber._element = newElementNode
    if (currentFiber.$fiber === '$1') { newElementNode.fiber = currentFiber }
    if (workInProgressFiber.$fiber === '$1') { newElementNode.fiber = workInProgressFiber }



    //todo 切换当前工作fiber
    global.workInprogressFiberNode = workInProgressFiber


    //如果tag大写 解析为FC组件节点
    if (newElementNode.tag[0] === newElementNode.tag[0].toUpperCase()) {
        workInProgressFiber.nodeType = 'FunctionComponent'
        workInProgressFiber.stateNode = newElementNode.ref
        childElement = transformElementTreeToBinadyTree(newElementNode.ref(), newElementNode) //! 重新生成新的二叉element树
    }
    //解析为text节点 挂载dom节点
    else if (newElementNode.tag === 'text') {
        workInProgressFiber.nodeType = 'HostText'
        workInProgressFiber.text = newElementNode.text
        workInProgressFiber.stateNode = currentFiber.stateNode
    }
    //解析为普通dom节点
    else {
        workInProgressFiber.nodeType = 'HostComponent'
        workInProgressFiber.stateNode = currentFiber.stateNode
    }

    //深度优先递归执行
    if (currentFiber._child) {
        const childWkFiber = updateFiberTree(childElement, workInProgressFiber._child, currentFiber._child)
        workInProgressFiber._child = childWkFiber
    }
    if (currentFiber._sibling) {
        const siblingWkFiber = updateFiberTree(siblingElement, workInProgressFiber._sibling, currentFiber._sibling)
        workInProgressFiber._sibling = siblingWkFiber
    }

    return workInProgressFiber
}

//! ---------新建一个alternateFiber----------
function createAlternate(currentFiber: FiberNode) {
    //todo 新建一个fiberNode
    const workInProgressFiber = new FiberNode('update', '$2')

    //! 将一些属性复制给workInProgress
    workInProgressFiber.stateQueueTimer = currentFiber.stateQueueTimer
    workInProgressFiber.updateQueue = currentFiber.updateQueue
    workInProgressFiber.hookIndex = currentFiber.hookIndex
    workInProgressFiber.memorizedState = currentFiber.memorizedState
    workInProgressFiber.nodeType = currentFiber.nodeType
    workInProgressFiber.tag = currentFiber.tag

    //! 链接两个fiber 
    workInProgressFiber.alternate = currentFiber
    currentFiber.alternate = workInProgressFiber

    //! 链接parent
    if (currentFiber._parent) {
        workInProgressFiber._parent = currentFiber._parent.alternate
    }

    return workInProgressFiber
}









//! 创建Placement的fiberNode  类似createFiberTree
function placementFiberTree(source: any, resources: any, parentNode: FiberNode) {

    //todo 创建一个新的fiber节点(浅拷贝) 更新当前工作节点
    let newFiberNode = new NewFiberNode('mount', parentNode.$fiber)
    //todo 预处理Fiber  生成vnode 挂载resource
    const { children, tag } = preHandleFiberNode(source, resources, newFiberNode)
    //todo 挂载父节点
    newFiberNode.parentNode = parentNode
    //TODO -----------如果tag大写 解析为组件节点(无children) ----------------
    if (tag[0] === tag[0].toUpperCase()) {
        //! 处理为组件节点   并继续向下递归render子函数组件
        handleFunctionFiberNode(newFiberNode, tag)

        placementFunctionComponent(newFiberNode)
    }

    //TODO ----------小写的情况  是dom节点 创建Effect 交给commit阶段执行添加--------
    else {
        newFiberNode.nodeType = 'HostText'
    }

    //todo 继续向下深度优先递归  创建子fiber 挂到当前节点
    placementFiberTreeLoop(children, newFiberNode)

    newFiberNode.fiberFlags = 'update'

    //适配路由
    useRoute(newFiberNode)
    //todo 在这里创建一个effect!

    return newFiberNode
}

//! 根据子vnode 递归创建创建Placement的fiberNode 并进行拼接-------------
function placementFiberTreeLoop(childVnodes: any, parentNode: FiberNode) {
    if (childVnodes.length > 0) {
        parentNode.nodeType = 'HostComponent'
        for (let i = 0; i < childVnodes.length; i++) {
            const childFiberNode = placementFiberTree(childVnodes[i], parentNode.sourcePool, parentNode)
            parentNode.children.push(childFiberNode)
        }
    }
}

//! 添加函数组件节点
function placementFunctionComponent(fiber: FiberNode) {

    if (typeof fiber.stateNode !== 'function') return

    const { template, data = {}, components = {} } = fiber.stateNode()

    const childFiberNode = placementFiberTree(template, { data, components }, fiber)
    //todo 生成子树并链接
    fiber.children = [childFiberNode]

}




export { updateFiberTree, createAlternate }