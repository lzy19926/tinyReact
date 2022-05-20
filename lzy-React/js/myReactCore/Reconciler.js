"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileText = exports.reconcileDeletion = exports.reconcilePlacement = exports.reconcileEvent = void 0;
const GlobalFiber_1 = require("./GlobalFiber");
//! 更新事件
function reconcileEvent(workInProgressFiber, currentFiber) {
    // TODO 如果节点有挂载事件  需要更新这些事件!!!!!!!!!
    const wkProps = workInProgressFiber.props;
    // 如果有事件 创建对应的Effect
    const hasEvent = wkProps.hasOwnProperty('onClick' || 'onMouseOver');
    if (hasEvent) {
        pushEffectList('Update', workInProgressFiber);
    }
}
exports.reconcileEvent = reconcileEvent;
//! 计算Props
function reconcileProps(workInProgressFiber, currentFiber) {
    pushEffectList('Update', workInProgressFiber);
}
//! 计算Text
function reconcileText(workInProgressFiber, currentFiber) {
    pushEffectList('Update', workInProgressFiber);
}
exports.reconcileText = reconcileText;
//! 计算tag
function reconcileTag(workInProgressFiber, currentFiber) {
}
//! 添加
function reconcilePlacement(workInProgressFiber) {
    pushEffectList('Placement', workInProgressFiber);
}
exports.reconcilePlacement = reconcilePlacement;
//! 删除
function reconcileDeletion(workInProgressFiber, currentFiber) {
}
exports.reconcileDeletion = reconcileDeletion;
//! 创建并添加Effect到EffectList
function pushEffectList(tag, targetFiber, callback) {
    const newEffect = {
        tag,
        targetFiber,
        callback: '暂定',
        next: null
    };
    //todo 链接到全局EffectList单链表
    const EffectList = GlobalFiber_1.global.EffectList;
    if (EffectList.firstEffect === null) {
        EffectList.firstEffect = newEffect;
        EffectList.lastEffect = newEffect;
    }
    else {
        EffectList.lastEffect.next = newEffect;
        EffectList.lastEffect = newEffect;
    }
    EffectList.length += 1;
}
