import { FiberNode } from './Interface'
import { global } from './GlobalFiber'


//! 更新事件
function reconcileEvent(workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    // TODO 如果节点有挂载事件  需要更新这些事件!!!!!!!!!
    const wkProps = workInProgressFiber.props
    if (!wkProps) return
    // 如果有事件 创建对应的Effect
    const hasEvent = wkProps.hasOwnProperty('onClick' || 'onMouseOver')

    if (hasEvent) {
        pushEffectList('Update', workInProgressFiber)
    }
}

//! 判断是否有useEffect钩子调用
function reconcileUseEffect(workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    if (workInProgressFiber.updateQueue) {
        pushEffectList('UseEffect', workInProgressFiber)
    }
}



//! 计算Props
function reconcileProps(workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    pushEffectList('Update', workInProgressFiber)
}

//! 计算Text
function reconcileText(workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    if (!workInProgressFiber.text || !currentFiber.text) return

    if (workInProgressFiber.text !== currentFiber.text) {
        pushEffectList('Update', workInProgressFiber)
    }
}

//! 计算tag
function reconcileTag(workInProgressFiber: FiberNode, currentFiber: FiberNode) {

}



//! 添加(待优化)
function reconcilePlacement(workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    const wkKey = workInProgressFiber?.key
    const curKey = currentFiber?.key

    // 或者有cur  无work算为插入节点
    if (!currentFiber && workInProgressFiber) {
        pushEffectList('Placement', workInProgressFiber)
    }

}

//! 删除
function reconcileDeletion(workInProgressFiber: FiberNode, currentFiber: FiberNode) {


    //todo wk没有节点 current有节点 删除current
    if (!workInProgressFiber && currentFiber) {
        pushEffectList('Delete', currentFiber)
        return false
    }

    //todo 如果有key  且不一样 删除current 否则下一次会进行大量更新(需要重写)
    else if (workInProgressFiber.key || currentFiber.key) {
        if (workInProgressFiber.key !== currentFiber.key) {
            pushEffectList('Delete', currentFiber)
            return false
        }
    }

    return true
}

//! 创建并添加Effect到EffectList
function pushEffectList(tag: string, targetFiber: FiberNode, callback?: Function) {
    const newEffect = {
        tag, // Effect的类型
        targetFiber, // 需要执行的fiber节点
        callback: '暂定',
        next: null
    }
    //todo 链接到全局EffectList单链表
    const EffectList = global.EffectList

    if (EffectList.firstEffect === null) {
        EffectList.firstEffect = newEffect
        EffectList.lastEffect = newEffect
    } else {
        EffectList.lastEffect.next = newEffect
        EffectList.lastEffect = newEffect
    }
    EffectList.length += 1
}


//! diff两个节点综合方法
//! ----------比较wk和cur两个fiber  生成不同的Effect (打上tag)-------------
function reconcileFiberNode(workInProgressFiber: FiberNode, currentFiber: FiberNode) {

    //TODO 开始先进行删除和添加的diff计算  (需要在最先进行 因为之后的就不需要进行了)
    reconcilePlacement(workInProgressFiber, currentFiber)
    let needDiff = true
    if (workInProgressFiber && !currentFiber) {
        // reconcilePlacement(workInProgressFiber, currentFiber)
        needDiff = false
    } else if (!workInProgressFiber && currentFiber) {
        reconcileDeletion(workInProgressFiber, currentFiber)
        needDiff = false
    } else if (workInProgressFiber.key !== currentFiber.key) {

    }



    if (needDiff) {

        // TODO 进行text的判断 生成Effect
        reconcileText(workInProgressFiber, currentFiber)

        //TODO 有事件更新事件
        reconcileEvent(workInProgressFiber, currentFiber)

        //TODO 判断是否使用了useEffect
        reconcileUseEffect(workInProgressFiber, currentFiber)
    }

}


export { reconcileFiberNode }