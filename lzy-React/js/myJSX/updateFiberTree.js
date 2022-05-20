"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFiberTree = void 0;
const GlobalFiber_1 = require("../myReactCore/GlobalFiber");
const Reconciler_1 = require("../myReactCore/Reconciler");
const createFiberTree_1 = require("./createFiberTree");
//! ---------------更新fiberTree (在这里生成第二棵fiberTree 判断节点是否变化)-------------------
function updateFiberTree(source, resources, parentNode, workInProgressFiber, currentFiber) {
    // 添加节点逻辑
    if (!currentFiber) {
        const placementFiber = placementFiberTree(source, resources, parentNode);
        return placementFiber;
    }
    // 如果没有  生成一个alternate并挂载  
    if (!workInProgressFiber) {
        workInProgressFiber = createAlternate(currentFiber);
    }
    //todo 预处理Fiber  生成vnode 挂载resource
    const { children, tag } = (0, createFiberTree_1.preHandleFiberNode)(source, resources, workInProgressFiber);
    //todo 挂载parentNode
    workInProgressFiber.parentNode = parentNode;
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
        let childWkFiber = workInProgressFiber.children[i];
        let childCurFiebr = currentFiber.children[i];
        //todo 有则创建子节点 进行拼接 无则直接遍历更新
        if (childWkFiber) {
            updateFiberTree(vnode, resources, workInProgressFiber, childWkFiber, childCurFiebr);
        }
        else {
            workInProgressFiber.children[i] = updateFiberTree(vnode, resources, workInProgressFiber, childWkFiber, childCurFiebr);
        }
    }
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
    const resources = { data, components };
    //todo 如果没有子节点  那么需要在这里链接父子树  或者直接向下遍历更新
    if (!childWkFiber) {
        workInProgressFiber.children = [updateFiberTree(template, resources, workInProgressFiber, childWkFiber, childCurFiebr)];
    }
    else {
        updateFiberTree(template, resources, workInProgressFiber, childWkFiber, childCurFiebr);
    }
}
//! 创建Placement的fiberNode  类似createFiberTree
function placementFiberTree(source, resources, parentNode) {
    //todo 创建一个新的fiber节点(浅拷贝) 更新当前工作节点
    let newFiberNode = new GlobalFiber_1.NewFiberNode('mount', parentNode.$fiber);
    //todo 预处理Fiber  生成vnode 挂载resource
    const { children, tag } = (0, createFiberTree_1.preHandleFiberNode)(source, resources, newFiberNode);
    //todo 挂载父节点
    newFiberNode.parentNode = parentNode;
    //TODO -----------如果tag大写 解析为组件节点(无children) ----------------
    if (tag[0] === tag[0].toUpperCase()) {
        //! 处理为组件节点   并继续向下递归render子函数组件
        (0, createFiberTree_1.handleFunctionFiberNode)(newFiberNode, tag);
        placementFunctionComponent(newFiberNode);
    }
    //TODO ----------小写的情况  是dom节点 创建Effect 交给commit阶段执行添加--------
    else {
        newFiberNode.nodeType = 'HostText';
        (0, Reconciler_1.reconcilePlacement)(newFiberNode);
    }
    //todo 继续向下深度优先递归  创建子fiber 挂到当前节点
    placementFiberTreeLoop(children, newFiberNode);
    newFiberNode.fiberFlags = 'update';
    //模拟finishowrk
    // console.log('finishWork', newFiberNode.tag);
    //适配路由
    (0, createFiberTree_1.useRoute)(newFiberNode);
    return newFiberNode;
}
//! 根据子vnode 递归创建创建Placement的fiberNode 并进行拼接-------------
function placementFiberTreeLoop(childVnodes, parentNode) {
    if (childVnodes.length > 0) {
        parentNode.nodeType = 'HostComponent';
        for (let i = 0; i < childVnodes.length; i++) {
            const childFiberNode = placementFiberTree(childVnodes[i], parentNode.sourcePool, parentNode);
            parentNode.children.push(childFiberNode);
        }
    }
}
//! 添加函数组件节点
function placementFunctionComponent(fiber) {
    if (typeof fiber.stateNode !== 'function')
        return;
    const { template, data = {}, components = {} } = fiber.stateNode();
    const childFiberNode = placementFiberTree(template, { data, components }, fiber);
    //todo 生成子树并链接
    fiber.children = [childFiberNode];
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
    const wk = workInProgressFiber;
    const cur = currentFiber;
    // TODO 进行text的判断 生成Effect
    if (wk.text !== cur.text) {
        console.log(workInProgressFiber.text, currentFiber.text);
        (0, Reconciler_1.reconcileText)(workInProgressFiber, currentFiber); //! 生成Effect
    }
    //TODO 有事件更新事件
    (0, Reconciler_1.reconcileEvent)(workInProgressFiber, currentFiber);
}
