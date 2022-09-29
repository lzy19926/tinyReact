"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFiberWorkLoop = exports.createFiberWorkLoop2 = exports.handleProps = exports.createTextElement = exports.createDomElement = exports.createFiberTree = void 0;
const GlobalFiber_1 = require("../myReactCore/GlobalFiber");
const createElement_1 = require("../myJSX/createElement");
function createFiberTree(elementNode, parentFiber) {
    let newFiberNode = new GlobalFiber_1.FiberNode('mount', '$1');
    let childElement = elementNode._child;
    let siblingElement = elementNode._sibling;
    //todo 切换当前工作fiber
    GlobalFiber_1.global.workInprogressFiberNode = newFiberNode;
    newFiberNode.tag = elementNode.tag;
    newFiberNode._parent = parentFiber;
    newFiberNode._element = elementNode;
    elementNode.fiber = newFiberNode;
    //如果tag大写 解析为FC组件节点 执行渲染
    if (elementNode.tag[0] === elementNode.tag[0].toUpperCase()) {
        newFiberNode.nodeType = 'FunctionComponent';
        newFiberNode.stateNode = elementNode.ref;
        childElement = (0, createElement_1.transformElementTreeToBinadyTree)(elementNode.ref(), elementNode); //! 重新生成新的二叉element树
    }
    //解析为text节点
    else if (elementNode.tag === 'text') {
        newFiberNode.nodeType = 'HostText';
        newFiberNode.text = elementNode.text;
        createTextElement(newFiberNode);
    }
    //解析为普通dom节点
    else {
        newFiberNode.nodeType = 'HostComponent';
        createDomElement(newFiberNode);
    }
    // 深度优先递归执行
    if (childElement) {
        const childFiber = createFiberTree(childElement, newFiberNode);
        newFiberNode._child = childFiber;
    }
    if (siblingElement) {
        const siblingFiber = createFiberTree(siblingElement, parentFiber);
        newFiberNode._sibling = siblingFiber;
    }
    // 更改状态
    newFiberNode.fiberFlags = 'update';
    return newFiberNode;
}
exports.createFiberTree = createFiberTree;
//! -------------创建html并挂载到fiber节点上--------------------
function createDomElement(fiber) {
    //找到父dom节点 将创建好的dom节点添加进去
    const parentDom = getParentDom(fiber);
    let domElement = document.createElement(fiber.tag);
    handleProps(fiber, domElement);
    parentDom.appendChild(domElement);
    fiber.stateNode = domElement;
    return domElement;
}
exports.createDomElement = createDomElement;
//! -------------创建text节点并挂载到fiber节点上--------------------
function createTextElement(fiber) {
    //找到父dom节点 将创建好的dom节点添加进去
    const parentDom = getParentDom(fiber);
    let textElement = document.createTextNode(fiber.text);
    parentDom.appendChild(textElement);
    fiber.stateNode = textElement;
    return textElement;
}
exports.createTextElement = createTextElement;
//! ----------找到父dom节点---------------------
function getParentDom(fiber) {
    let parentNode = fiber._parent;
    let parentDom = parentNode === null || parentNode === void 0 ? void 0 : parentNode.stateNode;
    if (!parentNode) {
        return document.getElementById('root');
    }
    while (typeof parentDom === 'function') {
        parentNode = parentNode._parent;
        if (!parentNode) {
            return document.getElementById('root');
        }
        parentDom = parentNode.stateNode;
    }
    return parentDom;
}
//! 对标签中的属性进行处理 给dom节点添加标签 (未完成)
function handleProps(fiber, dom) {
    const props = fiber._element.props;
    for (let key in props) {
        const value = props[key];
        switch (key) {
            //todo  处理className (合并所有的类名)
            case 'className':
                let classNameStr = '';
                for (let i = 0; i < value.length; i++) {
                    classNameStr += value[i] + ' ';
                }
                dom.setAttribute("class", classNameStr.trim());
                break;
            //todo  处理class (合并所有的类名)
            case 'class':
                let classStr = '';
                for (let i = 0; i < value.length; i++) {
                    classStr += value[i] + ' ';
                }
                dom.setAttribute("class", classStr.trim());
                break;
            //todo  处理点击事件(还需处理其他事件)
            case 'onClick':
                dom.onclick = value;
                break;
            //todo  处理其他
            default:
                dom.setAttribute(key, value);
                break;
        }
    }
}
exports.handleProps = handleProps;
//todo 深度优先遍历  优先进入child  再进入sibling 都无的情况返回parent 进入sibling （交替执行begin和completeWork）
function createFiberWorkLoop2(elementNode) {
    if (Symbol.keyFor(elementNode.$$typeof) === 'textElement') {
        console.log('执行completeWork', elementNode.$$typeof);
        if (elementNode._child) {
            createFiberWorkLoop(elementNode._child);
        }
        if (elementNode._sibling) {
            createFiberWorkLoop(elementNode._sibling);
        }
    }
    else {
        console.log('执行beginWork', elementNode.$$typeof);
        if (elementNode._child) {
            createFiberWorkLoop(elementNode._child);
        }
        if (elementNode._sibling) {
            createFiberWorkLoop(elementNode._sibling);
        }
        console.log('执行completeWork', elementNode.$$typeof);
    }
}
exports.createFiberWorkLoop2 = createFiberWorkLoop2;
//todo 深度优先遍历  构建fiber树
function createFiberWorkLoop(elementNode) {
    console.log('执行beginWork', elementNode.$$typeof);
    if (elementNode._child) {
        console.log('进入child');
        createFiberWorkLoop(elementNode._child);
    }
    if (elementNode._sibling) {
        console.log('进入sibling');
        createFiberWorkLoop(elementNode._sibling);
    }
}
exports.createFiberWorkLoop = createFiberWorkLoop;
function test() {
    const obj = {
        $$typeof: Symbol('lzyElement'),
        tag: "div",
        props: null,
        children: [
            {
                $$typeof: Symbol('lzyElement'),
                tag: "div",
                props: {
                    id: 1,
                    name: "张三"
                },
                children: [
                    {
                        $$typeof: Symbol('lzyTextElement'),
                        text: "文字内容"
                    },
                    {
                        $$typeof: Symbol('lzyElement'),
                        tag: "div",
                        props: {
                            id: 1,
                            name: "张三"
                        },
                        children: [
                            {
                                text: "1"
                            }
                        ]
                    },
                    {
                        $$typeof: Symbol('lzyElement'),
                        tag: "div",
                        props: {
                            id: 1,
                            name: "张三"
                        },
                        children: [
                            {
                                text: "1"
                            }
                        ]
                    },
                    {
                        $$typeof: Symbol('lzyElement'),
                        tag: "div",
                        props: null,
                        children: [
                            {
                                text: "Child"
                            }
                        ]
                    }
                ]
            }
        ]
    };
    console.log((0, createElement_1.transformElementTreeToBinadyTree)(obj, 1));
}
