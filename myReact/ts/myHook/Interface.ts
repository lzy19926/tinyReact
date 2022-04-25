
//todo ----------------------Interface----------------------------------------
//!--------------单个UseEffectHook结构-------------------
//todo 通过判断tag 'useEffect','useLayoutEffect' 来判断何种钩子  改变执行时机
interface UseEffectHook {
    hookFlags: string,
    index: number,
    memorizedState: any,
    next: any
}
//!------------单个Effect(EffectUpdater)结构--------------------
interface Effect {
    tag: string,
    create: Function,
    next: Effect | null,
    destory: Function | null,
    deps: any[] | null,
}

//!-------------单个useStateHook结构-----------------
interface UseStateHook {
    hookFlags: string,
    index: number,
    memorizedState: any,
    updateStateQueue: { pending: any },//! hook.queue中保存了需要执行的update
    next: any
}
//!-------------单个StateUpdater结构--------------------
interface StateUpdater {
    action: Function | any,
    next: StateUpdater | null
}
//!------------fiberNode结构----------------------
interface FiberNode {
    memorizedState: any,
    stateNode: Function,
    updateQueue: any,
    fiberFlags: string,
    hasRef: boolean,
    ref: any,
    children: any,
    props: any,
    tag: any,
    text: any,
}
//!-------------全局需要的变量结构---------------
interface Global {
    workInProgressHook: { currentHook: any },
    hookIndex: number,
    currentFiberNode: FiberNode
}


export type { FiberNode, StateUpdater, Effect, UseStateHook, UseEffectHook, Global }