"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkInProgressHook = exports.global = void 0;
//todo ------------------全局使用的结构和变量 方法-----------------------------
//! --------组件对应的fiber---------------------
let rootFiber = {
    memorizedState: null,
    stateNode: () => { },
    updateQueue: null,
    stateQueueTimer: null,
    fiberFlags: 'mount',
    hasRef: false,
    ref: null,
    children: [],
    props: null,
    tag: null,
    text: null,
    sourcePool: null,
    hookIndex: 0,
    parentNode: null,
    nodeType: undefined
};
//! -----需要使用的全局变量---------------
const global = {
    rootFiber,
    workInProgressHook: { currentHook: null },
    currentFiberNode: rootFiber,
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
