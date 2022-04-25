"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFiberTree = void 0;
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
        fiberFlags: 'mount',
        hasRef: false,
        ref: null,
        children,
        props,
        tag,
        text,
    };
    //todo 当前正在工作的fiber节点
    GlobalFiber_1.global.currentFiberNode = fiberNode;
    //todo 生成子vnodeTree挂载到cihldren上
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
