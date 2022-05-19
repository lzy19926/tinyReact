"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFiberTree = void 0;
const GlobalFiber_1 = require("../myReactCore/GlobalFiber");
const createFiberTree_1 = require("./createFiberTree");
// //! ---------------更新fiberTree (todo!!在这里生成第二棵fiberTree 判断节点是否变化)-------------------
// function updateFiberTree(source: any, resources: any, fiber: FiberNode,) {
//     //todo 判断传入的source 转换成vnode
//     let vnode = typeof source === 'string' ? tplToVDOM(source) : source
//     //todo 赋值当前正在工作的fiber节点
//     let currentFiber = global.currentFiberNode = fiber
//     //todo 合并处理vnode和Fiber 挂载resource
//     const { children = [], tag, text, props } = vnode
//     //todo 合并vnode和fiber属性
//     currentFiber = conbineVnodAndFiber(currentFiber, vnode, resources)
//     //TODO -----------如果tag大写 解析为组件 ----------------
//     if (tag[0] == tag[0].toUpperCase()) {
//         //! 从sourcePool中获取子组件
//         const fc = currentFiber.sourcePool.components[tag]
//         //! 从资源池中拿取需要的props，给子函数组件绑定需要的props,并挂载子函数组件到fiber上
//         handleFunctionComponentProps(currentFiber, fc)
//         //! 执行函数并继续向下更新fiberTree
//         updateRenderFunctionComponent(currentFiber)
//     }
//     //todo 如果有children 深度优先遍历  
//     if (children) {
//         for (let i = 0; i < children.length; i++) {
//             //! 当map添加item时  可能造成vnode和childrenFiber数量不等
//             //! 如果发现没有此fiber 就再根据vnode创建一个fiber
//             const vnode = children[i]
//             const resources = currentFiber.sourcePool
//             //todo 这里发现有添加节点的情况创建了 fiberNode
//             const childFiber = currentFiber.children[i] || createFiberTree(vnode, resources, currentFiber)
//             currentFiber.children[i] = updateFiberTree(vnode, childFiber, resources)
//         }
//     }
//     //todo  如果是Route组件 将container的fiber传递给子组件 (暂时放到全局)
//     //! 用于适配路由
//     if (fiber.tag === 'RouteContainer') {
//         window.$$routeContainerFiber = fiber
//     }
//     return currentFiber
function updateFiberTree(source, resources, workInProgressFiber, currentFiber) {
    // 添加节点逻辑
    if (!workInProgressFiber && !currentFiber) {
        console.log('需要添加节点');
    }
    // 如果没有  生成一个alternate并挂载  
    if (!workInProgressFiber) {
        workInProgressFiber = createAlternate(currentFiber);
    }
    //todo 预处理Fiber  生成vnode 挂载resource
    const { children, tag } = (0, createFiberTree_1.preHandleFiberNode)(source, resources, workInProgressFiber);
    //TODO -----------如果tag大写 解析为组件 ----------------
    if (tag[0] === tag[0].toUpperCase()) {
        //! 处理为组件节点
        (0, createFiberTree_1.handleFunctionFiberNode)(workInProgressFiber, tag);
        // ! 函数节点执行函数并继续向下更新fiberTree
        updateRenderFunctionComponent(workInProgressFiber, currentFiber);
    }
    //TODO ----------小写的情况  是domComponent节点/text节点 挂载dom节点--------
    else {
        workInProgressFiber.nodeType = 'HostText';
        workInProgressFiber.stateNode = currentFiber.stateNode;
    }
    //TODO ---------diff两个节点 打上tag 生成Effect交给commit阶段更新------------
    reconcileFiberNode(workInProgressFiber, currentFiber);
    //todo 如果有children 深度优先遍历  
    if (children.length > 0) {
        workInProgressFiber.nodeType = 'HostComponent';
        updateFiberTreeLoop(children, workInProgressFiber, currentFiber);
    }
    // 模拟finishedWork
    // workInProgressFiber.fiberFlags = 'update'
    // console.log('finishWork', workInProgressFiber.tag);
    //适配路由
    (0, createFiberTree_1.useRoute)(workInProgressFiber);
    return workInProgressFiber;
}
exports.updateFiberTree = updateFiberTree;
//! 根据子vnode 递归更新子fiberNode 并进行拼接-------------
function updateFiberTreeLoop(childVnodes, workInProgressFiber, currentFiber) {
    for (let i = 0; i < childVnodes.length; i++) {
        //! 当map添加item时  可能造成vnode和childrenFiber数量不等
        //! 如果发现没有此fiber 就再根据vnode创建一个fiber
        const vnode = childVnodes[i];
        const resources = workInProgressFiber.sourcePool;
        //todo 这里发现有添加节点的情况创建了 fiberNode          
        const childWkFiber = workInProgressFiber.children[i];
        const childCurFiebr = currentFiber.children[i] || (0, createFiberTree_1.createFiberTree)(vnode, resources, currentFiber);
        //todo 有则创建子节点 进行拼接 无则直接遍历更新
        if (childWkFiber) {
            updateFiberTree(vnode, resources, childWkFiber, childCurFiebr);
        }
        else {
            workInProgressFiber.children[i] = updateFiberTree(vnode, resources, childWkFiber, childCurFiebr);
        }
    }
}
//! ---------创建Fiber替代并链接----------
function createAlternate(currentFiber) {
    //todo 新建一个fiberNode
    const workInProgressFiber = new GlobalFiber_1.NewFiberNode('update', '$2');
    //! 将一些属性复制给workInProgress
    workInProgressFiber.stateQueueTimer = currentFiber.stateQueueTimer;
    workInProgressFiber.updateQueue = currentFiber.updateQueue;
    workInProgressFiber.hookIndex = currentFiber.hookIndex;
    workInProgressFiber.memorizedState = currentFiber.memorizedState;
    //! 链接两个fiber 
    workInProgressFiber.alternate = currentFiber;
    currentFiber.alternate = workInProgressFiber;
    return workInProgressFiber;
}
//! ----------比较wk和cur两个fiber  生成Effect 打上tag-------------
function reconcileFiberNode(workInProgressFiber, currentFiber) {
    // console.log(workInProgressFiber.props, currentFiber.props);
    // console.log(workInProgressFiber.tag, currentFiber.tag);
    // console.log(workInProgressFiber.text, currentFiber.text);
}
//! -----------------update子函数组件-----------------------
function updateRenderFunctionComponent(workInProgressFiber, currentFiber) {
    //处理函数组件  执行函数获得新的数据  往下传递 继续向下递归
    if (typeof workInProgressFiber.stateNode !== 'function')
        return;
    const { template, data = {}, components = {} } = workInProgressFiber.stateNode();
    //todo继续让子fiber向下递归更新
    let childWkFiber = workInProgressFiber.children[0];
    let childCurFiebr = currentFiber.children[0];
    //todo 如果没有子节点  那么需要在这里链接父子树  或者直接向下遍历更新
    if (!childWkFiber) {
        workInProgressFiber.children = [updateFiberTree(template, { data, components }, childWkFiber, childCurFiebr)];
    }
    else {
        updateFiberTree(template, { data, components }, childWkFiber, childCurFiebr);
    }
}
