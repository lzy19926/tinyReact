import { FiberNode, Global } from './Interface'

//todo ------------------全局使用的结构和变量 方法-----------------------------
//! --------组件对应的fiber---------------------
let iniFiber: FiberNode = {
    memorizedState: null,// fiber上的所有hook链表(正在执行的hook会进入workInProgressHook)
    stateNode: () => { },    // 对应的函数组件
    updateQueue: null, // Effects的更新链表
    fiberFlags: 'mount',// fiber的生命周期 判断是否初始化
    hasRef: false,//ref相关tag
    ref: null,
    children: null,
    props: null,
    tag: null,
    text: null,
    sourcePool: null, ///! 组件返回的资源  props和事件
    hookIndex: 0 // 用于记录hook的数量 以便查找
}


//! -----需要使用的全局变量---------------
const global: Global = {
    rootFiber: iniFiber,
    workInProgressHook: { currentHook: null },//React中使用链表来保存hooks 挂在全局
    currentFiberNode: iniFiber,
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


export { global, updateWorkInProgressHook }
