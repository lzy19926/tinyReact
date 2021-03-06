import { Effect, UseEffectHook } from '../myReactCore/Interface'
//修改全局变量的方法
import { global, updateWorkInProgressHook } from '../myReactCore/GlobalFiber'
import { pushEffectList } from '../myReactCore/Reconciler'

//! -------mountEffect(useEffect第一次执行)-------------
function mountEffect(fiberFlags: string, hookFlags: string, create: Function, deps: any[] | null) {


    //todo 创建Hook 成为fiber.memorizedState上的一项Hook (单向链表)
    const hook = mountWorkInProgressHook()
    //判断是否传入deps 不同时机执行useEffect
    const nextDeps = deps === undefined ? null : deps

    //! 根据deps传入不同的情况  实现useEffect的不同使用
    //此时memorizedState保存的就是最后更新的Effect数据(第一次destory为undefined)
    if (nextDeps === null) {
        hook.memorizedState = pushEffect('nullDeps', create, undefined, nextDeps)
    } else if (nextDeps.length === 0) {
        hook.memorizedState = pushEffect('noDeps', create, undefined, nextDeps)
    } else {
        hook.memorizedState = pushEffect('depNoChange', create, undefined, nextDeps)
    }


    //todo mount后 hookFlag变为update
    hook.hookFlags = 'update'
}


//! --------创建一个Hook 形成环链表 添加到hook队列--------------
function mountWorkInProgressHook() {
    const fiber = global.workInprogressFiberNode//! 测试

    //todo 新建一个hook
    const newHook: UseEffectHook = {
        index: 0,
        memorizedState: null,
        hookFlags: 'mount',
        next: null
    }

    // 添加Hook进单向链表
    if (fiber.memorizedState !== null) {
        const lastHook = fiber.memorizedState
        newHook.index = lastHook.index + 1
        newHook.next = lastHook
        fiber.memorizedState = newHook
    }

    //接入hook到fiber上
    fiber.memorizedState = newHook
    //接入hook到workProgress
    global.workInProgressHook.currentHook = newHook


    return newHook
}


//! -------updateEffect(useEffect后续更新)-------------
function updateEffect(fiberFlags: string, hookFlags: string, create: Function, deps: any[] | null) {
    const fiber = global.workInprogressFiberNode//! 测试

    const currentHook = updateWorkInProgressHook(fiber)


    //判断是否传入deps 不同时机执行useEffect
    const nextDeps = deps === undefined ? null : deps
    //!执行updateEffect 改变fiberFlages
    //! fiber.fiberFlags = fiberFlags

    //todo  如果有currentHook 获得上一次执行create返回的的销毁函数
    if (currentHook !== null) {

        const prevEffect = currentHook.memorizedState //最后一次Effect

        //todo update时从上一次的Effect中取出销毁函数(在commit阶段执行create函数并赋值了destory)
        const destory = prevEffect.destory


        //! 根据传入的dep 判断是否执行effect
        //注意 无论如何都会推入Effect  
        if (nextDeps !== null) {
            //todo 浅比较上次和本次的deps是否相等  传入不同的tag  用于减少更新
            const prveDeps = prevEffect.deps
            if (shallowCompareDeps(nextDeps, prveDeps)) {
                pushEffect('depNoChange', create, destory, nextDeps)
                return
            }
            //todo 如果deps发生改变  传入的tag为'depChanged' commit时这个Effects才会被执行
            //todo  (执行的最后一个effect要被赋值给memorizedState)
            else {
                currentHook.memorizedState =
                    pushEffect('depChanged', create, destory, nextDeps)
            }
        }

        //! 如果没有传deps 表示任意时候都执行
        if (nextDeps === null) {
            pushEffect('nullDeps', create, undefined, nextDeps)
        }
    }
}


//! ------浅比较前后deps是否发生变化-------------------
function shallowCompareDeps(nextDeps: any[], prveDeps: any[]) {

    //todo console.log('前后dep对比', prveDeps, nextDeps);

    // 选取最大的lenght
    const length = nextDeps.length > prveDeps.length ? nextDeps.length : prveDeps.length
    let res = true
    for (let i = 0; i < length; i++) {
        if (nextDeps[i] !== prveDeps[i])
            return res = false
    }
    return res
}


//! --------pushEffect创建/增加Effects更新链表---------------
function pushEffect(tag: string, create: Function, destory: any, deps: any[] | null) {
    const fiber = global.workInprogressFiberNode//! 测试

    // 创建Effect 
    const effect: Effect = {
        tag,
        create,
        destory,
        deps,
        next: null
    }

    //todo 如果Hook上没有更新链表  创建更新链表  如果有则插入一个effect到更新环链表尾部
    const updateQueue: { lastEffect: Effect | null } = { lastEffect: null }
    if (fiber.updateQueue === null) {
        updateQueue.lastEffect = effect.next = effect // 自身形成环状链表
        //更新fiber上的updateQueue环链表
        fiber.updateQueue = updateQueue
    } else {
        const lastEffect = fiber.updateQueue.lastEffect

        if (lastEffect === null) {//todo 有链表结构但是链表为空
            updateQueue.lastEffect = effect.next = effect // 自身形成环状链表

        } else { // todo 插入effect到环链表尾端
            const firstEffect = lastEffect.next
            lastEffect.next = effect
            effect.next = firstEffect
            updateQueue.lastEffect = effect //此时环链表上的最后一项就是effect
            //更新fiber上的updateQueue环链表
            fiber.updateQueue = updateQueue
        }
    }

    //todo 返回这个Effect 会被赋值给hook.memorizedState(最后一次更新的状态)
    return effect
}


//!------------useEffect主体--------------
function myUseEffect(create: Function, deps?: any[]) {
    const nextDeps = deps === undefined ? null : deps
    const fiber = global.workInprogressFiberNode//! 测试

    // 第一次useEffect执行mountEffect
    if (fiber.fiberFlags === 'mount') {
        const hookFlags = 'mount'
        mountEffect('mount', hookFlags, create, nextDeps)
        // 后续useEffect执行updateEffect
    } else if (fiber.fiberFlags === 'update') {
        const hookFlags = 'update'
        updateEffect('update', hookFlags, create, nextDeps)
    }

    //创建一个新的Effect项 推入全局EffectList中 


}


//! 错误记录
// effect中的create函数在commit阶段执行
// 而且执行时  fiberFlag需要已经变为update  
// 否则create中执行setState 会重新render   此时render的fiberFlag是mount
// 那么就会陷入死循环

export { myUseEffect }