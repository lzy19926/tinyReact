import { FiberNode, Global } from './Interface'

//todo ------------------全局使用的结构和变量 方法-----------------------------
let fiber$1: FiberNode = {
    memorizedState: null,// fiber上的所有hook链表(正在执行的hook会进入workInProgressHook)
    stateNode: () => { },    // 对应的函数组件
    updateQueue: null, // 存放Effects的更新链表
    stateQueueTimer: null, // 用于state的合并更新(setTimeout)
    fiberFlags: 'mount',// fiber的生命周期 判断是否初始化
    hasRef: false,//ref相关tag
    ref: null,
    children: [],
    props: null,
    tag: null,
    text: null,
    sourcePool: null, //! 组件返回的资源  props和事件
    hookIndex: 0, // 用于记录hook的数量 以便查找
    parentNode: null, // 父节点
    nodeType: undefined, // fiber的类型
    alternate: null
}

let fiber$2: FiberNode = {
    memorizedState: null,// fiber上的所有hook链表(正在执行的hook会进入workInProgressHook)
    stateNode: () => { },    // 对应的函数组件
    updateQueue: null, // 存放Effects的更新链表
    stateQueueTimer: null, // 用于state的合并更新(setTimeout)
    fiberFlags: 'update',// fiber的生命周期 判断是否初始化
    hasRef: false,//ref相关tag
    ref: null,
    children: [],
    props: null,
    tag: null,
    text: null,
    sourcePool: null, //! 组件返回的资源  props和事件
    hookIndex: 0, // 用于记录hook的数量 以便查找
    parentNode: null, // 父节点
    nodeType: undefined, // fiber的类型
    alternate: null
}

let initFiberNode: FiberNode = {
    memorizedState: null,// fiber上的所有hook链表(正在执行的hook会进入workInProgressHook)
    stateNode: null,    // 对应的函数组件
    updateQueue: null, // Effects的更新链表
    stateQueueTimer: null, // 用于state的合并更新(setTimeout)
    fiberFlags: 'mount',// fiber的生命周期 判断是否初始化
    hasRef: false,//ref相关tag
    ref: null,
    children: [],
    props: null,
    tag: null,
    text: null,
    sourcePool: null, ///! 组件返回的资源  props和事件
    hookIndex: 0, // 用于记录hook的数量 以便查找
    parentNode: null,
    nodeType: undefined,
    alternate: null
}


//! -----需要使用的全局变量---------------
const global: Global = {
    workInProgressFiber: fiber$1, // fiber树 初始值为rootFiber
    currentFiber: fiber$2,// fiber树2
    workInProgressHook: { currentHook: null },//React中使用链表来保存hooks 挂在全局
    currentFiberNode: null, //! 当前工作的fiber节点
    destoryEffectsArr: [],
    renderTag: 'mount' // 用于判断是否是首次更新
}


//! ----------拿取需要本次update需要更新的hook----------------------
function updateWorkInProgressHook(fiber: FiberNode) {

    let index = fiber.hookIndex
    let currentHook = fiber.memorizedState

    while (currentHook && currentHook.index != index) {
        currentHook = currentHook.next
    }
    // 因为链表是按顺序的 所以这个函数每执行一次就新增一个
    fiber.hookIndex += 1
    return currentHook
}


export { global, updateWorkInProgressHook, initFiberNode }
