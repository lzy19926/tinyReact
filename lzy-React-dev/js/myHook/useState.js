"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myUseState = void 0;
const render_1 = require("./render");
// 全局变量和当前 Fiber
const GlobalFiber_1 = require("./GlobalFiber");
//! ---------------useState返回的updater方法(updateState方法)-------------------
function dispatchAction(queue, curFiber, newVal) {
    //todo 如果newVal未发生变化不执行更新
    // const oldVal = curFiber.memorizedState.memorizedState
    // if (newVal === oldVal) return
    //todo 更新state队列(在render阶段执行)
    updateQueue(queue, newVal);
    //todo 这里使用防抖 所有queue更新完后再执行render  将timer设置在fiber上以适配Rekv
    //将多个同步setState的render合并为一个
    clearTimeout(curFiber.stateQueueTimer);
    curFiber.stateQueueTimer = setTimeout(() => {
        //! 源码中使用切换fiber树的方式执行重新渲染 
        //! 从当前fiber节点  重新执行函数式组件  更新子fiber树(需要传入当前fiber进行递归)
        (0, render_1.updateRender)(curFiber.stateNode, curFiber.ref, curFiber);
    }, 0);
}
//! 更新setate更新队列
function updateQueue(queue, newVal) {
    //创建updater环链表 将action挂载上去
    const updater = {
        action: newVal,
        next: null
    };
    //pending上没有updater 自己形成环状链表  ; 有updater链表  插入一个updater
    if (queue.pending === null) {
        updater.next = updater;
    }
    else {
        updater.next = queue.pending.next;
        queue.pending.next = updater;
    }
    // 让此updater成为lastUpdater
    queue.pending = updater;
}
//! 创建一个useStateHook并添加到链表中------------------------
function createHook(initialState) {
    const fiber = GlobalFiber_1.global.currentFiberNode; //! 测试
    // 创建useState类型的hook
    const hook = {
        hookFlags: 'mount',
        index: fiber.memorizedState ? fiber.memorizedState.index + 1 : 0,
        memorizedState: initialState,
        updateStateQueue: { pending: null },
        next: null
    };
    // 将hook添加到fiber上,且将hook链接到全局hooks链表上  成为last项
    if (!fiber.memorizedState) {
        GlobalFiber_1.global.workInProgressHook.currentHook = hook;
    }
    else {
        const lastEffect = fiber.memorizedState;
        hook.next = lastEffect;
    }
    GlobalFiber_1.global.workInProgressHook.currentHook = hook;
    fiber.memorizedState = hook;
    return hook;
}
//! 更新该Hook的memorizedState-----------------------------
function updateUseStateHook(hook) {
    // 取出更新链表上的最后一个state
    let baseState = hook.memorizedState;
    //pending保存了链表最后一项   next就指向第一个update
    if (hook.updateStateQueue.pending) {
        let firstUpdate = hook.updateStateQueue.pending.next;
        // queue链表 执行update(执行update上的action(update传入的参数 num=>num+1))  
        do {
            const action = firstUpdate.action;
            //todo 更新baseState 分为传入函数和传入newValue两种情况
            baseState = typeof action === 'function'
                ? action(baseState)
                : action;
            firstUpdate = firstUpdate.next; // 链表后移
            // 终止遍历链表
        } while (firstUpdate !== hook.updateStateQueue.pending.next);
        // 清空state更新链表
        hook.updateStateQueue.pending = null;
    }
    // 遍历结束 将更新后的baseState存放到hook.memorizedState上
    hook.memorizedState = baseState;
    return baseState;
}
//! ----------执行useState会执行state的计算过程----------------
function myUseState(initialState) {
    //todo  需要找到当前的fiber节点()
    let fiber = GlobalFiber_1.global.currentFiberNode;
    //取出当前hook 如果是mount阶段就创建一个hook(初始值为initState)
    let hook;
    if (fiber.fiberFlags === 'mount') {
        hook = createHook(initialState); //创建hook 添加到hook链表
    }
    else {
        // 更新情况 找到对应的hook
        hook = (0, GlobalFiber_1.updateWorkInProgressHook)(fiber);
    }
    //todo 更新hook上保存的state
    const baseState = updateUseStateHook(hook);
    //todo 执行完useState 钩子状态变为update
    hook.hookFlags = 'update';
    //todo 返回最新的状态 和updateAction 
    //todo bind本次useState的fiber节点 用于从当前组件开始更新
    return [baseState, dispatchAction.bind(null, hook.updateStateQueue, fiber)];
}
exports.myUseState = myUseState;
