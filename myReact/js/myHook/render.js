"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unmountPart = exports.commitPart = exports.resetFiber = exports.updateRender = exports.render = void 0;
//! render分为2部分  render阶段 - commit阶段  最后unmount
const GlobalFiber_1 = require("./GlobalFiber");
const createFiberTree_1 = require("../myJsx/createFiberTree");
//! ----------------模拟render部分------------------------
//! 更改并生成fiber树  (结束后fiber由mount变为update)
function renderPart(functionComponent) {
    //todo 首次执行App函数
    const { template, data, components } = functionComponent();
    const resource = { data, components };
    //todo根据组件构建fiberTree(首次)
    const fiberTree = (0, createFiberTree_1.createFiberTree)(template, resource);
    GlobalFiber_1.global.rootFiber = fiberTree;
    return fiberTree;
}
//todo 获取上一次的fiberTree 执行所有打上tag的functionComponent进行state更新 再commit   
function updateRenderPart(functionComponent) {
    // 改变tag
    GlobalFiber_1.global.renderTag = 'update';
    // 更新函数组件
    const { template, data, components } = functionComponent();
    const resource = { data, components };
    const newFiberTree = (0, createFiberTree_1.updateFiberTree)(template, GlobalFiber_1.global.rootFiber, resource);
    GlobalFiber_1.global.rootFiber = newFiberTree;
    return newFiberTree;
}
//! -----------------模拟Commit阶段-----------------------------
//! 分为三部分  beforeMutation  mutation  layout阶段
//! before 前置处理  mutation 渲染dom节点   layout  处理useEffect useLayoutEffect
function commitPart(fiber, rootDom) {
    console.log('本次commit的fiber', fiber);
    //todo  mutation阶段
    removeHtml(rootDom);
    createHtml(fiber, rootDom); //根据fiberTree创建html
    //! 这里为了简化重新render  将root节点挂载上去了  需要更正
    fiber.ref = rootDom; //挂载ref
    //todo  layout阶段  调用Effects链表 执行create函数()
    handleEffect(fiber);
    //todo 处理ref
    if (fiber.hasRef) {
        // commitAttachRef()//绑定ref
    }
}
exports.commitPart = commitPart;
//! 删除子节点
function removeHtml(rootDom) {
    const childDom = rootDom.children[0];
    if (childDom) {
        rootDom.removeChild(childDom);
    }
}
//! 根据fiberTree创建html
//此方法可以随时停止  传入需要改变的fiberNode实现最小量更新
function createHtml(fiberTree, rootDom) {
    const container = document.createDocumentFragment();
    appendDom(fiberTree, container);
    rootDom.appendChild(container); //添加渲染好的dom
}
//!  -------------根据fiberTree创建html------------------
//todo 根据tag创建节点  填充text  递归appendChild
function appendDom(fiber, container) {
    //todo 如果是小写 判断为html标签  填充文本 处理属性
    const dom = document.createElement(fiber.tag);
    handleProps(fiber, dom);
    if (fiber.text) {
        dom.innerHTML = fiber.text;
    }
    //todo 如果有children深度优先递归渲染dom节点 
    if (fiber.children) {
        fiber.children.forEach((fiber) => {
            appendDom(fiber, dom);
        });
    }
    container.appendChild(dom);
}
//! 对标签中的属性进行处理 给dom节点添加标签 (未完成)
function handleProps(curFiber, dom) {
    const props = curFiber.props;
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
            //todo  处理点击事件
            case 'onClick':
                //! 从组件的资源池里找对应的事件
                const dataPool = curFiber.sourcePool.data;
                const callback = dataPool[value[0]];
                dom.addEventListener("click", callback);
                break;
            //todo  处理其他
            default:
                dom.setAttribute(key, value[0]);
                break;
        }
    }
}
//! 遍历树获取所有的Effect(执行create和生成destory函数数组)
function handleEffect(fiber) {
    let destoryEffectsArr = [];
    if (fiber.updateQueue) {
        const createEffectsArr = createCallbackQueue(fiber);
        destoryEffectsArr = doCreateQueue(createEffectsArr);
    }
    if (fiber.children.length !== 0) {
        fiber.children.forEach((fiber) => {
            handleEffect(fiber);
        });
    }
    GlobalFiber_1.global.destoryEffectsArr.push(...destoryEffectsArr);
}
//todo 遍历Effect链表 将需要执行的Effect推入数组--------------
function createCallbackQueue(fiber) {
    const createEffectsArr = [];
    const lastEffect = fiber.updateQueue.lastEffect;
    const firstEffect = lastEffect.next;
    let currentEffect = firstEffect;
    do {
        //判断effectTag决定是否执行Effect(mount和dep变更时执行)
        //React底层通过二进制来打tag
        const isFiberMount = Boolean(GlobalFiber_1.global.renderTag === 'mount');
        const isDepChange = Boolean(currentEffect.tag === 'depChanged');
        const isNullDeps = Boolean(currentEffect.tag === 'nullDeps');
        const isNoDeps = Boolean(currentEffect.tag === 'noDeps');
        //根据不同情况 将Effect推入数组  达到不同的useEffect的效果
        if (isFiberMount || isDepChange || isNullDeps) {
            createEffectsArr.push(currentEffect);
        }
        else if (isFiberMount && isNoDeps) {
            createEffectsArr.push(currentEffect);
        }
        currentEffect = currentEffect.next;
    } while (currentEffect !== firstEffect);
    return createEffectsArr;
}
//todo 遍历执行需要执行的Effect---生成destory---------
function doCreateQueue(createEffectsArr) {
    const destoryEffectsArr = [];
    //todo 遍历Effects数组 执行create  
    //todo 生成destoryEffect数组 将destory存放到对应的Effect上
    for (let i = 0; i < createEffectsArr.length; i++) {
        const destory = createEffectsArr[i].create(); // 执行create
        if (destory) {
            createEffectsArr[i].destory = destory; // 赋值destory
            destoryEffectsArr.push(createEffectsArr[i]); //推入destory数组
        }
    }
    return destoryEffectsArr;
}
//! ----------模拟unmount阶段 -------------------------
//todo  清空上一次执行完的updateQueue 重置HookIndex 执行distory函数数组
function unmountPart() {
    doDestoryQueue(GlobalFiber_1.global.destoryEffectsArr);
    resetFiber(GlobalFiber_1.global.rootFiber);
}
exports.unmountPart = unmountPart;
//todo -----在unmounted时执行destorys数组
function doDestoryQueue(destoryEffectsArr) {
    for (let i = 0; i < destoryEffectsArr.length; i++) {
        const destory = destoryEffectsArr[i].destory;
        if (destory) {
            destory();
        }
    }
}
//todo ----遍历清空fiber树上的hookIndex 和 queue
function resetFiber(fiberTree) {
    fiberTree.hookIndex = 0;
    fiberTree.updateQueue = null;
    GlobalFiber_1.global.destoryEffectsArr = [];
    if (fiberTree.children.length !== 0) {
        fiberTree.children.forEach((fiber) => {
            resetFiber(fiber);
        });
    }
}
exports.resetFiber = resetFiber;
//!--------------综合Render方法-------------------
function render(functionComponent, rootDom) {
    console.log('------------render-------------');
    const fiber = renderPart(functionComponent); //todo render阶段
    commitPart(fiber, rootDom); //todo commit阶段
    unmountPart(); //todo unmount阶段
}
exports.render = render;
function updateRender(functionComponent, rootDom) {
    console.log('------------updateRender-------------');
    const newFiber = updateRenderPart(functionComponent);
    commitPart(newFiber, rootDom); //todo commit阶段
    unmountPart(); //todo unmount阶段
}
exports.updateRender = updateRender;
