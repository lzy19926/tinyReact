import { FiberNode } from './Interface'
import { global } from './GlobalFiber'


//! 更新事件
function reconcileEvent(workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    // TODO 如果节点有挂载事件  需要更新这些事件!!!!!!!!!
    const wkProps = workInProgressFiber.props
    // 如果有事件 创建对应的Effect
    const hasEvent = wkProps.hasOwnProperty('onClick' || 'onMouseOver')

    if (hasEvent) {
        pushEffectList('Update', workInProgressFiber)
    }
}

//! 计算Props
function reconcileProps(workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    pushEffectList('Update', workInProgressFiber)
}

//! 计算Text
function reconcileText(workInProgressFiber: FiberNode, currentFiber: FiberNode) {
    pushEffectList('Update', workInProgressFiber)
}

//! 计算tag
function reconcileTag(workInProgressFiber: FiberNode, currentFiber: FiberNode) {

}

//! 添加
function reconcilePlacement(workInProgressFiber: FiberNode) {
    pushEffectList('Placement', workInProgressFiber)
}

//! 删除
function reconcileDeletion(workInProgressFiber: FiberNode, currentFiber: FiberNode) {

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

export { reconcileEvent, reconcilePlacement, reconcileDeletion, reconcileText }