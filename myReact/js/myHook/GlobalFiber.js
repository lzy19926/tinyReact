"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkInProgressHook = exports.global = void 0;
//todo ------------------全局使用的结构和变量 方法-----------------------------
//! --------组件对应的fiber---------------------
let iniFiber = {
    memorizedState: null,
    stateNode: () => { },
    updateQueue: null,
    fiberFlags: 'mount',
    hasRef: false,
    ref: null,
    children: null,
    props: null,
    tag: null,
    text: null,
    sourcePool: null,
    hookIndex: 0 // 用于记录hook的数量 以便查找
};
//! -----需要使用的全局变量---------------
const global = {
    rootFiber: iniFiber,
    workInProgressHook: { currentHook: null },
    currentFiberNode: iniFiber,
    destoryEffectsArr: [],
    renderTag: 'mount' // 用于判断是否是首次更新
};
exports.global = global;
//! ----------拿取需要本次update需要更新的hook----------------------
function updateWorkInProgressHook(fiber) {
    let index = fiber.hookIndex;
    let currentHook = fiber.memorizedState;
    while (currentHook && currentHook.index != index) {
        currentHook = currentHook.next;
    }
    // 因为链表是按顺序的 所以这个函数每执行一次就新增一个
    fiber.hookIndex += 1;
    return currentHook;
}
exports.updateWorkInProgressHook = updateWorkInProgressHook;
