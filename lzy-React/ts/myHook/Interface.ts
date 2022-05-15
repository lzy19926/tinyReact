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
    stateNode: Function | HTMLElement | null,
    updateQueue: any,
    stateQueueTimer: any,
    fiberFlags: string,
    hasRef: boolean,
    ref: any,
    children: any,
    props: any,
    tag: any,
    text: any,
    sourcePool: any,
    hookIndex: number,
    parentNode: FiberNode | null,
    nodeType: 'HostText' | 'HostComponent' | 'FunctionComponent' | 'AppNode' | undefined
}

//!-------------全局需要的变量结构---------------
interface Global {
    rootFiber: FiberNode,
    workInProgressHook: { currentHook: any },
    currentFiberNode: FiberNode,
    destoryEffectsArr: Effect[],
    renderTag: string
}

export type { FiberNode, StateUpdater, Effect, UseStateHook, UseEffectHook, Global }