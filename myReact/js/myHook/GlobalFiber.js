"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkInProgressHook = exports.global = exports.fiber = void 0;
//todo ------------------全局使用的结构和变量 方法-----------------------------
//! --------组件对应的fiber---------------------
let fiber = {
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
};
exports.fiber = fiber;
//! -----需要使用的全局变量---------------
const global = {
    workInProgressHook: { currentHook: null },
    hookIndex: 0,
    currentFiberNode: fiber
};
exports.global = global;
//! ----------拿取需要本次update需要更新的hook----------------------
function updateWorkInProgressHook(index) {
    let currentHook = fiber.memorizedState;
    while (currentHook && currentHook.index != index) {
        currentHook = currentHook.next;
    }
    // 因为链表是按顺序的 所以这个函数每执行一次就新增一个
    global.hookIndex += 1;
    return currentHook;
}
exports.updateWorkInProgressHook = updateWorkInProgressHook;
