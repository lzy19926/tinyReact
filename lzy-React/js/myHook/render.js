"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetFiber = exports.updateRender = exports.render = void 0;
//! render分为2部分  render阶段 - commit阶段  最后unmount
const GlobalFiber_1 = require("./GlobalFiber");
const createFiberTree_1 = require("../myJSX/createFiberTree");
//! ----------------模拟render部分------------------------
//! 更改并生成fiber树  (结束后fiber由mount变为update)
function renderPart(functionComponent, rootDom, initFiber) {
    //todo 通过functionComponents生成第一个组件节点 如App
    const { template, resource, currentRootFiber } = firstRenderApp(functionComponent, initFiber);
    currentRootFiber.ref = rootDom;
    //todo根据组件构建fiberTree(首次)
    const fiberTree = (0, createFiberTree_1.createFiberTree)(template, resource, currentRootFiber);
    currentRootFiber.children.push(fiberTree);
    return currentRootFiber;
}
//todo 获取上一次的fiberTree 执行所有打上tag的functionComponent进行state更新 再commit   
function updateRenderPart(functionComponent, rootFiber) {
    // 改变tag
    GlobalFiber_1.global.renderTag = 'update';
    // 处理根App节点
    const { template, resource, rootFiberNode } = firstUpdateRenderApp(functionComponent, rootFiber);
    //todo 比较新旧节点是否发生变化
    // 更新函数组件(因为处理了根节点 从根节点的第一个子节点开始递归)
    const secondNode = rootFiberNode.children[0];
    // 此时不需要创建fiberNode  所以不需要添加childFiber  直接在根fiber树上更新
    (0, createFiberTree_1.updateFiberTree)(template, secondNode, resource);
    return rootFiberNode;
}
//对render根Fiber节点进行处理(否则无法渲染第一个根节点)
function firstRenderApp(functionComponent, currentRootFiber) {
    GlobalFiber_1.global.currentFiberNode = currentRootFiber;
    currentRootFiber.stateNode = functionComponent;
    currentRootFiber.nodeType = 'AppNode';
    //! 用于解决webpack 函数名出现bound问题 并赋值给此fiber的tag
    const functionNameArr = functionComponent.name.split(' ');
    currentRootFiber.tag = functionNameArr[0] === 'bound'
        ? functionNameArr[1]
        : functionNameArr[0];
    //! 处理向下传递的resource
    const { template, data, components } = functionComponent();
    const resource = { data, components };
    currentRootFiber.fiberFlags = 'update';
    return { template, resource, currentRootFiber };
}
function firstUpdateRenderApp(functionComponent, fiber) {
    const rootFiberNode = fiber;
    GlobalFiber_1.global.currentFiberNode = rootFiberNode;
    rootFiberNode.stateNode = functionComponent;
    //! 用于解决webpack 函数名出现bound问题
    const functionNameArr = functionComponent.name.split(' ');
    let functionName = functionNameArr[0] === 'bound'
        ? functionNameArr[1]
        : functionNameArr[0];
    rootFiberNode.tag = functionName;
    const { template, data, components } = functionComponent();
    const resource = { data, components };
    rootFiberNode.fiberFlags = 'update';
    return { template, resource, rootFiberNode };
}
//! -----------------模拟Commit阶段-----------------------------
//! 分为三部分  beforeMutation  mutation  layout阶段
//! before 前置处理  mutation 渲染dom节点   layout  处理useEffect useLayoutEffect
function commitPart(finishedWorkFiber) {
    //todo  mutation阶段 
    commitFiberNodeMutation(finishedWorkFiber);
    //todo  layout阶段  调用Effects链表 执行create函数()
    //todo 处理ref
}
function updateCommitPart(finishedWorkFiber) {
    //todo  mutation阶段
    commitFiberNodeMutation(finishedWorkFiber);
    //todo  layout阶段  调用Effects链表 执行create函数()
    //todo 处理ref
}
//! mutation阶段  遍历fiber树  每个节点执行更新(分为添加  删除  更新 三大部分 )
// 递归遍历fiber树(todo: 需要更改为二叉树)
function commitFiberNodeMutation(finishedWorkFiber) {
    let finishedWorkFlag = 'update';
    //! 经过相应处理 最后执行commitWork方法
    switch (finishedWorkFlag) {
        case 'placement': //todo  添加
            // commitPlacement()
            break;
        case 'delete': //todo  删除
            // commitDelete()
            break;
        case 'update': //todo  更新
            commitWork(finishedWorkFiber);
            break;
    }
    if (finishedWorkFiber.children) {
        finishedWorkFiber.children.forEach((finishedWorkFiber) => {
            commitFiberNodeMutation(finishedWorkFiber);
        });
    }
}
// todo 不同类型的fiberNode执行不同的更新
function commitWork(finishedWorkFiber) {
    const fiberType = finishedWorkFiber.nodeType;
    switch (fiberType) {
        //todo 函数组件 处理effects链表  
        case 'FunctionComponent':
            //遍历effect更新链表  执行每个上一次的destory和本次create,并挂载destory
            //在之前finishedWork阶段已经将所有effects收集 挂载到finishedWorkFiber上
            callDestoryAndUnmountDestoryList(finishedWorkFiber);
            callCreateAndMountDestoryList(finishedWorkFiber);
            break;
        //todo dom节点  执行dom更新操作
        case 'HostComponent':
            commitUpdateDom(finishedWorkFiber);
            break;
        //todo text节点 单独更新
        case 'HostText':
            commitUpdateText(finishedWorkFiber);
    }
}
// 错误记录 : 赋值dom节点新的text后   没有handleProps   
// 因为新的click函数的获取在这里   如果不执行  每次点击执行的都是上一次的点击事件 
// 所以不更新视图
// todo dom节点的更新
function commitUpdateDom(finishedWorkFiber) {
    // const domElement = finishedWorkFiber.stateNode
    // handleProps(finishedWorkFiber, domElement)
}
//TODO text节点的更新
function commitUpdateText(finishedWorkFiber) {
    const domElement = finishedWorkFiber.stateNode;
    // 这里更改的是dom.firstChild  会新建一个nodeValue
    //! 注意 这里需要处理props  不然点击事件不会更新  第二次点击num不会++  
    //! 点击时获取的num变量还是上一次的变量
    handleProps(finishedWorkFiber, domElement);
    // ! 比较text是否变化 变化则更改dom
    let fiberText = finishedWorkFiber.text;
    let domText = domElement.firstChild.nodeValue;
    if (domText !== fiberText) {
        domElement.firstChild.nodeValue = fiberText;
    }
}
//! 执行所有上一次挂载的destory  并销毁 
function callDestoryAndUnmountDestoryList(finishedWorkFiber) {
    //! (此时生成了新的fiber  老fiber会被unmount) 所以destory是在组件unmount时执行的
    var updateQueue = finishedWorkFiber.updateQueue;
    var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null) {
        var firstEffect = lastEffect.next;
        var currentEffect = firstEffect;
        do {
            //todo 判断是否需要执行 执行destory
            callCreateByTag(currentEffect);
            currentEffect = currentEffect.next;
        } while (currentEffect !== firstEffect);
    }
}
//! 执行所有的create 挂载destory
function callCreateAndMountDestoryList(finishedWorkFiber) {
    const updateQueue = finishedWorkFiber.updateQueue;
    var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    //todo do while遍历effect环链表 执行destory
    if (lastEffect !== null) {
        var firstEffect = lastEffect.next;
        var currentEffect = firstEffect;
        do {
            //todo 判断是否需要执行 执行create
            callDestoryByTag(currentEffect);
            currentEffect = currentEffect.next;
        } while (currentEffect !== firstEffect);
    }
}
//! 判断tag  执行create函数
function callCreateByTag(effect) {
    //判断effectTag决定是否执行Effect(mount和dep变更时执行)
    //React底层通过二进制来打tag
    const isFiberMount = Boolean(GlobalFiber_1.global.renderTag === 'mount');
    const isDepChange = Boolean(effect.tag === 'depChanged');
    const isNullDeps = Boolean(effect.tag === 'nullDeps');
    const isNoDeps = Boolean(effect.tag === 'noDeps');
    let needCallCreate = false;
    //根据不同情况 决定是否执行create 
    if ((isFiberMount || isDepChange || isNullDeps) || (isFiberMount && isNoDeps)) {
        needCallCreate = true;
    }
    //判断tag如果需要执行  执行create 挂载destory
    if (needCallCreate) {
        const create = effect.create;
        effect.destory = create();
    }
}
//! 判断tag  执行destory函数(需要修改)
function callDestoryByTag(effect) {
    //判断effectTag决定是否执行Effect(mount和dep变更时执行)
    //React底层通过二进制来打tag
    const isFiberMount = Boolean(GlobalFiber_1.global.renderTag === 'mount');
    const isDepChange = Boolean(effect.tag === 'depChanged');
    const isNullDeps = Boolean(effect.tag === 'nullDeps');
    const isNoDeps = Boolean(effect.tag === 'noDeps');
    let needCallDestory = false;
    //根据不同情况 决定是否执行create 
    if ((isFiberMount || isDepChange || isNullDeps) || (isFiberMount && isNoDeps)) {
        needCallDestory = true;
    }
    //判断tag如果需要执行  执行并销毁effect上的destory
    var destory = effect.destory;
    if (destory !== undefined && needCallDestory) {
        destory();
        effect.destory = undefined;
    }
}
//! ----------遍历fiber  收集effect 挂载到本次更新的root节点 ------------------
function finishedWork(beginWorkFiber) {
    // 遍历fiber树 将所有Effect添加进root节点的update环链表中
    let rootUpdateQueue = { lastEffect: null };
    conbineEffectsLink(beginWorkFiber, rootUpdateQueue);
    // 处理好的updateQueue成为到本次root节点的updateQueue
    beginWorkFiber.updateQueue = rootUpdateQueue;
    return beginWorkFiber;
}
//! 遍历fiber  拼接所有的effect  
function conbineEffectsLink(fiber, rootUpdateQueue) {
    // 当fiberUpdateQueue存在时 里面必然有effect
    // 拼接两个链表
    const fiberUpdateQueue = fiber.updateQueue;
    if (fiberUpdateQueue) {
        rootUpdateQueue.lastEffect = fiberUpdateQueue.lastEffect;
        fiberUpdateQueue.lastEffect.next = rootUpdateQueue.lastEffect.next;
    }
    // 遍历fiber树  拼接链表
    if (fiber.children.length !== 0) {
        fiber.children.forEach((fiber) => {
            conbineEffectsLink(fiber, rootUpdateQueue);
        });
    }
}
//!--------------综合Render方法-------------------
function render(functionComponent, rootDom, initFiber) {
    console.log('------------render-------------');
    //用于适配路由  需要从该fiber节点开始render
    if (!initFiber) {
        initFiber = GlobalFiber_1.global.rootFiber;
    }
    //todo render阶段
    const beginWorkFiber = renderPart(functionComponent, rootDom, initFiber);
    // 从下往上遍历fiber收集所有的Effects 形成环链表 上传递优先级给root
    const finishedWorkFiber = finishedWork(beginWorkFiber);
    //todo commit阶段
    commitPart(finishedWorkFiber);
}
exports.render = render;
function updateRender(functionComponent, rootFiber) {
    console.log('------------updateRender-------------');
    resetFiber(rootFiber); //更新render时需要先将fiber的数据重置  重新挂载数据
    const newFiber = updateRenderPart(functionComponent, rootFiber);
    updateCommitPart(newFiber);
}
exports.updateRender = updateRender;
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
//! --------------废弃部分   handleProps 和 createElement放在了createFiber文件中----------------
{
    //! (从更新的rootDom处开始)根据fiberTree创建html
    function updateHtml(fiber, rootDom) {
        //todo 深度优先递归children 从dom下一层渲染子dom节点 
        fiber.children.forEach((fiber) => {
            createHtml(fiber, rootDom);
        });
    }
    function createHtml(fiber, rootDom) {
        //不同的tag标签创建不同的html标签
        let dom = document.createElement(fiber.tag);
        //todo 如果是组件节点   挂载ref 
        if (fiber.tag[0] === fiber.tag[0].toUpperCase()) {
            dom = document.createElement('fc-' + fiber.tag);
            fiber.ref = dom;
            //todo 如果是小写 判断为html标签 填充文本 处理属性
        }
        else {
            handleProps(fiber, dom);
            if (fiber.text) {
                dom.innerHTML = fiber.text;
            }
        }
        //todo 深度优先递归children 从dom开始渲染子dom节点 
        fiber.children.forEach((fiber) => {
            createHtml(fiber, dom);
        });
        rootDom.appendChild(dom);
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
}
