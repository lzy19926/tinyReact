"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFiberTree = exports.createFiberTree = void 0;
const tplToVnode_1 = require("./tplToVnode");
const GlobalFiber_1 = require("../myHook/GlobalFiber");
//! 创建fiberNode树(Vnode树)
//! 深度优先遍历vnode树  包装成fiberNode
function creatFiberNode(vnode) {
    //todo 从vnode中解构出需要的值
    let { children = [], props, tag, text } = vnode;
    //todo 创建新fiberNode
    const fiberNode = {
        memorizedState: null,
        stateNode: () => { },
        updateQueue: null,
        fiberFlags: GlobalFiber_1.global.renderTag === 'mount' ? 'mount' : 'update',
        hasRef: false,
        ref: null,
        children,
        props,
        tag,
        text,
        hookIndex: 0
    };
    //todo 当前正在工作的fiber节点
    GlobalFiber_1.global.currentFiberNode = fiberNode;
    //解析单标签  暂定
    if (tag[tag.length - 1] == '/') {
        tag = tag.slice(0, tag.length - 1);
        fiberNode.tag = tag;
    }
    //TODO -----------如果tag大写 解析为组件(此时无children) ----------------
    if (tag[0] == tag[0].toUpperCase()) {
        fiberNode.stateNode = window['$$' + tag];
        const html = fiberNode.stateNode();
        const childVnode = (0, tplToVnode_1.tplToVDOM)(html);
        children.unshift(childVnode);
    }
    //TODO ------------单fiber节点处理结束  更改flag
    fiberNode.fiberFlags = 'update';
    //todo 如果有children 深度优先遍历  包装成fiberNode
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const vnode = children[i];
            fiberNode.children[i] = creatFiberNode(vnode);
        }
    }
    return fiberNode;
}
function createFiberTree(htmlTplStr) {
    const vnode = (0, tplToVnode_1.tplToVDOM)(htmlTplStr);
    const fiberTree = creatFiberNode(vnode);
    return fiberTree;
}
exports.createFiberTree = createFiberTree;
//! 更新fiberTree
function updateFiberTree(htmlTplStr) {
    //! 因为之前创建了app外层 这里从fiber.children[0]开始更新
    const vnode = (0, tplToVnode_1.tplToVDOM)(htmlTplStr);
    const fiberTree = updateFiberNode(vnode, GlobalFiber_1.fiber.children[0]);
    return fiberTree;
}
exports.updateFiberTree = updateFiberTree;
function updateFiberNode(vnode, fiber) {
    const currentFiber = fiber;
    //todo 从vnode中解构出需要的值
    let { children = [], props, tag, text } = vnode;
    currentFiber.props = props;
    currentFiber.tag = tag;
    currentFiber.text = text;
    //todo 当前正在工作的fiber节点
    GlobalFiber_1.global.currentFiberNode = currentFiber;
    //TODO -----------如果tag大写 解析为组件 生成html(此时无children) ----------------
    if (tag[0] == tag[0].toUpperCase()) {
        currentFiber.stateNode = window['$$' + tag];
        const html = currentFiber.stateNode();
        const childVnode = (0, tplToVnode_1.tplToVDOM)(html);
        children.unshift(childVnode);
    }
    //todo 如果有children 深度优先遍历  
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const vnode = children[i];
            //! 当map添加item时  可能造成vnode和childrenFiber数量不等
            //! 如果发现没有此fiber 就再根据vnode创建一个fiber
            const childFiber = currentFiber.children[i] || creatFiberNode(vnode);
            currentFiber.children[i] = updateFiberNode(vnode, childFiber);
        }
    }
    return currentFiber;
}
