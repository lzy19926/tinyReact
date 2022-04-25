

// 类型声明
import { StateUpdater, UseStateHook } from './Interface'
import { render, updateRender } from './render'
// 全局变量和当前 Fiber
import { fiber, global, updateWorkInProgressHook } from './GlobalFiber'

//! ---------------useState返回的updater方法(updateState方法)-------------------
function dispatchAction(queue: any, newVal?: any, action?: Function) {
    // const fiber = global.currentFiberNode//! 测试
    console.log(global.currentFiberNode);

    //创建updater环链表
    const updater: StateUpdater = {
        action: newVal || action,
        next: null
    }
    //pending上没有updater 自己形成环状链表  ; 有updater链表  插入一个updater
    if (queue.pending === null) {
        updater.next = updater
    } else {
        updater.next = queue.pending.next
        queue.pending.next = updater
    }
    // 让此updater成为lastUpdater
    queue.pending = updater


    //! 重新render组件  这里需要调用unmount生命周期钩子
    //! 源码中使用切换fiber树的方式执行重新渲染 不需要执行生命周期(处理fiber树时变相执行了unmount阶段)
    // fiber.updateQueue = null
    global.hookIndex = 0


    //todo 多个setState会触发多个render  实际上会将多个setState合并执行
    updateRender(fiber.stateNode, fiber.ref)
}



//! 创建一个useStateHook并添加到链表中------------------------
function createHook(initialState: any) {
    const fiber = global.currentFiberNode//! 测试

    // 创建useState类型的hook
    const hook: UseStateHook = {
        hookFlags: 'mount',
        index: fiber.memorizedState ? fiber.memorizedState.index + 1 : 0,//如果fiber上没有则直接为0
        memorizedState: initialState, //记录useState中的state
        updateStateQueue: { pending: null },//! hook.queue中保存了需要执行的update
        next: null
    }
    // 将hook添加到fiber上,且将hook链接到全局hooks链表上  成为last项
    if (!fiber.memorizedState) {
        global.workInProgressHook.currentHook = hook
    } else {
        const lastEffect = fiber.memorizedState
        hook.next = lastEffect
    }

    global.workInProgressHook.currentHook = hook
    fiber.memorizedState = hook
    return hook
}

//! 更新该Hook的memorizedState-----------------------------
function updateUseStateHook(hook: UseStateHook) {


    // 取出更新链表上的最后一个state
    let baseState = hook.memorizedState

    //pending保存了链表最后一项   next就指向第一个update
    if (hook.updateStateQueue.pending) {
        let firstUpdate = hook.updateStateQueue.pending.next;
        // queue链表 执行update(执行update上的action(update传入的参数 num=>num+1))  
        do {
            const action = firstUpdate.action
            //todo 更新baseState 分为传入函数和传入newValue两种情况
            baseState = typeof action === 'function'
                ? action(baseState)
                : action
            firstUpdate = firstUpdate.next // 链表后移
            // 终止遍历链表
        } while (firstUpdate !== hook.updateStateQueue.pending.next)
        // 清空state更新链表
        hook.updateStateQueue.pending = null
    }
    // 遍历结束 将更新后的baseState存放到hook.memorizedState上


    hook.memorizedState = baseState
    return baseState
}


//! ----------执行useState会执行state的计算过程----------------
function myUseState(initialState: any) {


    //todo  需要找到当前的fiber节点()
    console.log('当前工作的fiber节点', global.currentFiberNode);
    let fiber = global.currentFiberNode


    //取出当前hook 如果是mount阶段就创建一个hook(初始值为initState)
    let hook;
    if (fiber.fiberFlags === 'mount') {
        hook = createHook(initialState) //创建hook 添加到hook链表
    } else {
        // 更新情况 找到对应的hook
        hook = updateWorkInProgressHook(global.hookIndex)
    }


    console.log(hook);



    //todo 更新hook上保存的state
    const baseState = updateUseStateHook(hook)
    //todo 执行完useState 钩子状态变为update
    hook.hookFlags = 'update'
    //todo 返回最新的状态 和updateAction
    return [baseState, dispatchAction.bind(null, hook.updateStateQueue)]
}


export { myUseState }


//useState执行逻辑



