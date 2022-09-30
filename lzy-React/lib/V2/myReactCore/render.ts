
import { createFiberTree, createDomElement, createTextElement, handleProps, createAlternate } from '../myJSX/createFiberTree'
import { createBinadyElementTree } from '../myJSX/createElement'
import { updateFiberTree } from '../myJSX/updateFiberTree'
import { reconcileFiberNode, reconcileUseEffect } from './Reconciler'
import { FiberNode, global } from './GlobalFiber'


//!--------------首屏Render方法-------------------
function firstRenderPart(functionComponent: any, rootDom: HTMLElement) {

    const elementTree = createBinadyElementTree(functionComponent, undefined)

    const rootFiber = createFiberTree(elementTree, undefined)

    createAlternate(rootFiber)
    return rootFiber
}

//todo 获取上一次的fiberTree 执行所有打上tag的functionComponent进行state更新 再commit   
function updateRenderPart(functionComponent: Function, workInProgressFiber: FiberNode, currentFiber: FiberNode) {

    // 改变tag
    global.renderTag = 'update'

    const parentElement = currentFiber?._parent?._element

    const newElementTree = createBinadyElementTree(functionComponent, parentElement)

    const workInProgressRootFiber = updateFiberTree(newElementTree, workInProgressFiber, currentFiber, 'rootUpdateFiber')

    return workInProgressRootFiber
}


//! -----------------模拟Commit阶段-----------------------------
//! 分为三部分  beforeMutation  mutation  layout阶段
//! before 前置处理  mutation 渲染dom节点   layout  处理useEffect useLayoutEffect
function commitPart(finishedWorkFiber: FiberNode) {

    beforeMutation(finishedWorkFiber)  // beforeMutation阶段

    commitFiberNodeMutation(global.EffectList) //  mutation阶段 

    //todo  layout阶段  调用Effects链表 执行create函数()

    //todo 处理ref
}

function updateCommitPart(finishedWorkFiber: FiberNode) {

    beforeMutation(finishedWorkFiber)   // beforeMutation阶段

    commitFiberNodeMutation(global.EffectList)  // mutation阶段 

    //todo  layout阶段  调用Effects链表 执行create函数()


    //todo 处理ref
}

//! beforeMutation阶段 (将收集好的useEffect生成一个Effect 推入链表)
function beforeMutation(finishedWorkFiber: FiberNode) {
    reconcileUseEffect(finishedWorkFiber, null)
}

//! mutation阶段  遍历EffectList  对每个节点执行更新(分为添加  删除  更新 三大部分 )
//todo 遍历EffectList单链表 预留优先级调用 更新fiber
function commitFiberNodeMutation(EffectList: any, lane?: any) {
    console.log('本次更新的EffectList', EffectList);

    let currentEffect = EffectList.firstEffect

    // TODO 在这里将effect循环用requestAnimationFrame抱起来执行中断
    while (currentEffect !== null) {
        let effectTag = currentEffect.tag
        let targetFiber = currentEffect.targetFiber
        //! 经过相应处理 最后执行commitWork方法
        switch (effectTag) {
            case 'Placement'://todo  添加
                commitPlacement(targetFiber)
                break;
            case 'Delete'://todo  删除
                commitDeletion(targetFiber)
                break;
            case 'Update'://todo  更新
                commitUpdate(targetFiber)
                break;
            case 'UseEffect'://todo 调用了useEffect钩子
                commitUpdate(targetFiber)
            default:
                // commitUpdate(targetFiber) //todo 处理更新链表(effect链表和其他的effect应该是在一起的)
                break;
        }

        currentEffect = currentEffect.next
    }



}

//todo 待完成 插入dom节点
function commitPlacement(finishedWorkFiber: FiberNode) {
    if (finishedWorkFiber.nodeType === 'HostComponent') {
        createDomElement(finishedWorkFiber)
    }
    if (finishedWorkFiber.nodeType === 'HostText') {
        createTextElement(finishedWorkFiber)
    }
}

// todo 不同类型的fiberNode执行不同的更新 (在这里处理useEffect链表)
function commitUpdate(finishedWorkFiber: FiberNode) {
    const fiberType = finishedWorkFiber.nodeType
    switch (fiberType) {
        //todo 函数组件 处理effects链表  
        case 'FunctionComponent':
            //遍历effect更新链表  执行每个上一次的destory和本次create,并挂载destory
            //在之前finishedWork阶段已经将所有effects收集 挂载到finishedWorkFiber上
            callDestoryAndUnmountDestoryList(finishedWorkFiber)
            callCreateAndMountDestoryList(finishedWorkFiber)
            break;
        //todo App根组件 处理effects链表  
        case 'AppNode':
            callDestoryAndUnmountDestoryList(finishedWorkFiber)
            callCreateAndMountDestoryList(finishedWorkFiber)
            break;
        //todo dom节点  执行dom更新操作
        case 'HostComponent':
            commitUpdateDom(finishedWorkFiber)
            break;
        //todo text节点 单独更新
        case 'HostText':
            commitUpdateText(finishedWorkFiber)
    }

}

// todo 删除多余的currentFiber和dom节点
function commitDeletion(currentFiber: FiberNode) {
    // 删除dom节点
    const dom = currentFiber.stateNode
    if (typeof dom !== 'function') {
        dom.remove()
    }
    //从父节点处删除该节点？？？？？？
    const parentNode = currentFiber._parent
    parentNode._child = undefined
}


//todo 记录  我这里直接遍历fiber树  发现有需要变更的节点直接进行变更,
//todo 而react中在render阶段遍历 发现变更 打上tag  生成update , 推入effect链表中  为了实现优先级调度

// 错误记录 : 赋值dom节点新的text后   没有handleProps   
// 因为新的click函数的获取在这里   如果不执行  每次点击执行的都是上一次的点击事件 
// 所以不更新视图
// todo dom节点的更新
function commitUpdateDom(finishedWorkFiber: FiberNode) {
    const domElement = finishedWorkFiber.stateNode
    if (typeof domElement === 'function') return
    handleProps(finishedWorkFiber, domElement)

}

//TODO text节点的更新
function commitUpdateText(finishedWorkFiber: FiberNode) {
    const domElement = finishedWorkFiber.stateNode
    if (typeof domElement === 'function') return

    handleProps(finishedWorkFiber, domElement)
    // ! 比较text是否变化 变化则更改dom
    let fiberText = finishedWorkFiber.text
    let domText = domElement.textContent

    if (domText !== fiberText) {
        domElement.textContent = fiberText
    }
}


//! 执行所有上一次挂载的destory  并销毁
function callDestoryAndUnmountDestoryList(finishedWorkFiber: FiberNode) {
    //! (此时生成了新的fiber  老fiber会被unmount) 所以destory是在组件unmount时执行的
    var updateQueue = finishedWorkFiber.updateQueue;
    var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

    if (lastEffect !== null) {
        var firstEffect = lastEffect.next;
        var currentEffect = firstEffect;

        do {
            //todo 判断是否需要执行 执行destory
            callDestoryByTag(currentEffect)
            currentEffect = currentEffect.next
        }
        while (currentEffect !== firstEffect)
    }
}

//! 执行所有的create 挂载destory
function callCreateAndMountDestoryList(finishedWorkFiber: FiberNode) {
    const updateQueue = finishedWorkFiber.updateQueue
    var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;



    //todo do while遍历effect环链表 执行destory
    if (lastEffect !== null) {
        var firstEffect = lastEffect.next
        var currentEffect = firstEffect;

        do {
            //todo 判断是否需要执行 执行create

            callCreateByTag(currentEffect)
            currentEffect = currentEffect.next
        }
        while (currentEffect !== firstEffect)
    }
}

//! 判断tag  执行create函数
function callCreateByTag(effect: any) {

    //判断effectTag决定是否执行Effect(mount和dep变更时执行)
    //React底层通过二进制来打tag
    const isFiberMount = Boolean(global.renderTag === 'mount')
    const isDepChange = Boolean(effect.tag === 'depChanged')
    const isNullDeps = Boolean(effect.tag === 'nullDeps')
    const isNoDeps = Boolean(effect.tag === 'noDeps')
    let needCallCreate = false
    //根据不同情况 决定是否执行create 
    if ((isFiberMount || isDepChange || isNullDeps) || (isFiberMount && isNoDeps)) {
        needCallCreate = true
    }

    //判断tag如果需要执行  执行create 挂载destory
    if (needCallCreate) {
        const create = effect.create
        effect.destory = create()
    }

}

//! 判断tag  执行destory函数(需要修改)
function callDestoryByTag(effect: any) {

    //判断effectTag决定是否执行Effect(mount和dep变更时执行)
    //React底层通过二进制来打tag
    const isFiberMount = Boolean(global.renderTag === 'mount')
    const isDepChange = Boolean(effect.tag === 'depChanged')
    const isNullDeps = Boolean(effect.tag === 'nullDeps')
    const isNoDeps = Boolean(effect.tag === 'noDeps')
    let needCallDestory = false

    //根据不同情况 决定是否执行create 
    if ((isFiberMount || isDepChange || isNullDeps) || (isFiberMount && isNoDeps)) {
        needCallDestory = true
    }

    //判断tag如果需要执行  执行并销毁effect上的destory
    var destory = effect.destory;

    if (destory !== undefined && needCallDestory) {
        destory()
        effect.destory = undefined;
    }

}

//! ----------遍历fiber  收集effect 挂载到本次root节点 识别删除节点------------------
function finishedWork(workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    // 遍历fiber树 将所有Effect添加进root节点的update环链表中
    const root = workInProgressFiber
    let rootUpdateQueue = { lastEffect: null }

    finishedWorkLoop(workInProgressFiber, rootUpdateQueue)

    // 处理好的updateQueue成为到本次root节点的updateQueue
    root.updateQueue = rootUpdateQueue

    return root
}

//! 遍历fiber  拼接所有的effect   
function finishedWorkLoop(currentFiber: FiberNode, rootUpdateQueue: any) {

    // 将updateQueue拼接到fiber的queue上
    collectEffect(currentFiber, rootUpdateQueue)

    // 继续遍历fiber树  拼接链表 深度优先递归执行
    const childFiber = currentFiber._child
    const siblingFiber = currentFiber._sibling

    if (childFiber) {
        finishedWorkLoop(childFiber, rootUpdateQueue)
    }
    if (siblingFiber) {
        finishedWorkLoop(siblingFiber, rootUpdateQueue)
    }
}

//! 更新时的finishedWork(第一次不进入组件的sibling节点)
function updateFinishedWork(workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    // 遍历fiber树 将所有Effect添加进root节点的update环链表中
    let rootUpdateQueue = { lastEffect: null }

    // 首屏不需要diff  更新需要进行diff计算
    updateFinishedWorkLoop(workInProgressFiber, currentFiber, rootUpdateQueue, 'first')

    // 处理好的updateQueue成为到本次root节点的updateQueue
    workInProgressFiber.updateQueue = rootUpdateQueue

    return workInProgressFiber
}

function updateFinishedWorkLoop(
    workInProgressFiber: FiberNode,
    currentFiber: FiberNode,
    rootUpdateQueue: any,
    tag?: string
) {

    // 拼接两个链表
    collectEffect(workInProgressFiber, rootUpdateQueue)
    //TODO ---------diff两个节点 打上tag 生成Effect交给commit阶段更新------------

    reconcileFiberNode(workInProgressFiber, currentFiber)

    // 继续遍历fiber树  拼接链表
    if (workInProgressFiber._child) {
        updateFinishedWorkLoop(workInProgressFiber._child, currentFiber._child, rootUpdateQueue)
    }
    if (workInProgressFiber._sibling && tag !== 'first') {// 第一次不进入组件节点的sibling
        updateFinishedWorkLoop(workInProgressFiber._sibling, currentFiber._sibling, rootUpdateQueue)
    }
}

//todo ----遍历清空fiber树上的hookIndex 和 queue 和 EffectTag
function resetFiber(fiber: FiberNode) {
    fiber.hookIndex = 0
    fiber.updateQueue = null
    global.EffectList = { firstEffect: null, lastEffect: null, length: 0 }
    global.destoryEffectsArr = []

    if (fiber._child) {
        resetFiber(fiber._child)
    }
    if (fiber._sibling) {
        resetFiber(fiber._sibling)
    }
}

//! 将fiber的effect链表拼接到
function collectEffect(fiber: FiberNode, rootUpdateQueue: any) {
    if (!fiber) return
    const fiberUpdateQueue = fiber.updateQueue

    if (fiberUpdateQueue && fiberUpdateQueue.lastEffect) {
        rootUpdateQueue.lastEffect = fiberUpdateQueue.lastEffect
        fiberUpdateQueue.lastEffect.next = rootUpdateQueue.lastEffect.next
    }
}

//! ----------------首屏渲染----------------------------
function render(functionComponent: any, rootDom: HTMLElement) {
    console.log('------------first render-------------');

    const beginWorkFiber = firstRenderPart(functionComponent, rootDom)

    // 从下往上遍历fiber收集所有的Effects 形成链表 上传递优先级给root
    //! 这里finishedWork应该在renderPart中  这里拆分出来了
    const finishedWorkFiber = finishedWork(beginWorkFiber, null)

    //todo commit阶段
    commitPart(finishedWorkFiber)

    console.log('首屏渲染生成的fiber', finishedWorkFiber);

    return finishedWorkFiber
}

//! ----------------综合updateRender方法-------------------
function updateRender(functionComponent: Function, workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    console.log('------------update render-------------');

    resetFiber(currentFiber) //更新render时需要先将fiber的数据重置  重新挂载数据

    if (workInProgressFiber) {
        resetFiber(workInProgressFiber)//更新render时需要先将fiber的数据重置  重新挂载数据
    }

    // 更新fiber树
    const beginWorkFiber = updateRenderPart(functionComponent, workInProgressFiber, currentFiber)

    // 从下往上遍历fiber收集所有的Effects 形成环链表 上传递优先级给root
    const finishedWorkFiber = updateFinishedWork(beginWorkFiber, currentFiber)

    updateCommitPart(finishedWorkFiber)

    return finishedWorkFiber
}

export { render, updateRender }