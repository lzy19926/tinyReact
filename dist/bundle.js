/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Rekv": () => (/* reexport safe */ _js_myRekV_index__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   "global": () => (/* reexport safe */ _js_myReactCore_GlobalFiber__WEBPACK_IMPORTED_MODULE_3__.global),
/* harmony export */   "myUseEffect": () => (/* reexport safe */ _js_myHook_useEffect__WEBPACK_IMPORTED_MODULE_0__.myUseEffect),
/* harmony export */   "myUseState": () => (/* reexport safe */ _js_myHook_useState__WEBPACK_IMPORTED_MODULE_1__.myUseState),
/* harmony export */   "render": () => (/* reexport safe */ _js_myReactCore_render__WEBPACK_IMPORTED_MODULE_2__.render),
/* harmony export */   "updateRender": () => (/* reexport safe */ _js_myReactCore_render__WEBPACK_IMPORTED_MODULE_2__.updateRender)
/* harmony export */ });
/* harmony import */ var _js_myHook_useEffect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _js_myHook_useState__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _js_myReactCore_render__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _js_myReactCore_GlobalFiber__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(3);
/* harmony import */ var _js_myRekV_index__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11);








/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.myUseEffect = void 0;
//修改全局变量的方法
const GlobalFiber_1 = __webpack_require__(3);
//! -------mountEffect(useEffect第一次执行)-------------
function mountEffect(fiberFlags, hookFlags, create, deps) {
    //todo 创建Hook 成为fiber.memorizedState上的一项Hook (单向链表)
    const hook = mountWorkInProgressHook();
    //判断是否传入deps 不同时机执行useEffect
    const nextDeps = deps === undefined ? null : deps;
    //! 根据deps传入不同的情况  实现useEffect的不同使用
    //此时memorizedState保存的就是最后更新的Effect数据(第一次destory为undefined)
    if (nextDeps === null) {
        hook.memorizedState = pushEffect('nullDeps', create, undefined, nextDeps);
    }
    else if (nextDeps.length === 0) {
        hook.memorizedState = pushEffect('noDeps', create, undefined, nextDeps);
    }
    else {
        hook.memorizedState = pushEffect('depNoChange', create, undefined, nextDeps);
    }
    //todo mount后 hookFlag变为update
    hook.hookFlags = 'update';
}
//! --------创建一个Hook 形成环链表 添加到hook队列--------------
function mountWorkInProgressHook() {
    const fiber = GlobalFiber_1.global.workInprogressFiberNode; //! 测试
    //todo 新建一个hook
    const newHook = {
        index: 0,
        memorizedState: null,
        hookFlags: 'mount',
        next: null
    };
    // 添加Hook进单向链表
    if (fiber.memorizedState !== null) {
        const lastHook = fiber.memorizedState;
        newHook.index = lastHook.index + 1;
        newHook.next = lastHook;
        fiber.memorizedState = newHook;
    }
    //接入hook到fiber上
    fiber.memorizedState = newHook;
    //接入hook到workProgress
    GlobalFiber_1.global.workInProgressHook.currentHook = newHook;
    return newHook;
}
//! -------updateEffect(useEffect后续更新)-------------
function updateEffect(fiberFlags, hookFlags, create, deps) {
    const fiber = GlobalFiber_1.global.workInprogressFiberNode; //! 测试
    const currentHook = (0, GlobalFiber_1.updateWorkInProgressHook)(fiber);
    //判断是否传入deps 不同时机执行useEffect
    const nextDeps = deps === undefined ? null : deps;
    //!执行updateEffect 改变fiberFlages
    //! fiber.fiberFlags = fiberFlags
    //todo  如果有currentHook 获得上一次执行create返回的的销毁函数
    if (currentHook !== null) {
        const prevEffect = currentHook.memorizedState; //最后一次Effect
        //todo update时从上一次的Effect中取出销毁函数(在commit阶段执行create函数并赋值了destory)
        const destory = prevEffect.destory;
        //! 根据传入的dep 判断是否执行effect
        //注意 无论如何都会推入Effect  
        if (nextDeps !== null) {
            //todo 浅比较上次和本次的deps是否相等  传入不同的tag  用于减少更新
            const prveDeps = prevEffect.deps;
            if (shallowCompareDeps(nextDeps, prveDeps)) {
                pushEffect('depNoChange', create, destory, nextDeps);
                return;
            }
            //todo 如果deps发生改变  传入的tag为'depChanged' commit时这个Effects才会被执行
            //todo  (执行的最后一个effect要被赋值给memorizedState)
            else {
                currentHook.memorizedState =
                    pushEffect('depChanged', create, destory, nextDeps);
            }
        }
        //! 如果没有传deps 表示任意时候都执行
        if (nextDeps === null) {
            pushEffect('nullDeps', create, undefined, nextDeps);
        }
    }
}
//! ------浅比较前后deps是否发生变化-------------------
function shallowCompareDeps(nextDeps, prveDeps) {
    //todo console.log('前后dep对比', prveDeps, nextDeps);
    // 选取最大的lenght
    const length = nextDeps.length > prveDeps.length ? nextDeps.length : prveDeps.length;
    let res = true;
    for (let i = 0; i < length; i++) {
        if (nextDeps[i] !== prveDeps[i])
            return res = false;
    }
    return res;
}
//! --------pushEffect创建/增加Effects更新链表---------------
function pushEffect(tag, create, destory, deps) {
    const fiber = GlobalFiber_1.global.workInprogressFiberNode; //! 测试
    // 创建Effect 
    const effect = {
        tag,
        create,
        destory,
        deps,
        next: null
    };
    //todo 如果Hook上没有更新链表  创建更新链表  如果有则插入一个effect到更新环链表尾部
    const updateQueue = { lastEffect: null };
    if (fiber.updateQueue === null) {
        updateQueue.lastEffect = effect.next = effect; // 自身形成环状链表
        //更新fiber上的updateQueue环链表
        fiber.updateQueue = updateQueue;
    }
    else {
        const lastEffect = fiber.updateQueue.lastEffect;
        if (lastEffect === null) { //todo 有链表结构但是链表为空
            updateQueue.lastEffect = effect.next = effect; // 自身形成环状链表
        }
        else { // todo 插入effect到环链表尾端
            const firstEffect = lastEffect.next;
            lastEffect.next = effect;
            effect.next = firstEffect;
            updateQueue.lastEffect = effect;
            //更新fiber上的updateQueue环链表
            fiber.updateQueue = updateQueue;
        }
    }
    //todo 返回这个Effect 会被赋值给hook.memorizedState(最后一次更新的状态)
    return effect;
}
//!------------useEffect主体--------------
function myUseEffect(create, deps) {
    const nextDeps = deps === undefined ? null : deps;
    const fiber = GlobalFiber_1.global.workInprogressFiberNode; //! 测试
    // 第一次useEffect执行mountEffect
    if (fiber.fiberFlags === 'mount') {
        const hookFlags = 'mount';
        mountEffect('mount', hookFlags, create, nextDeps);
        // 后续useEffect执行updateEffect
    }
    else if (fiber.fiberFlags === 'update') {
        const hookFlags = 'update';
        updateEffect('update', hookFlags, create, nextDeps);
    }
    //创建一个新的Effect项 推入全局EffectList中 
}
exports.myUseEffect = myUseEffect;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NewFiberNode = exports.updateWorkInProgressHook = exports.global = void 0;
//! ----------Fiber节点结构---------------
class NewFiberNode {
    constructor(fiberFlags, $fiber) {
        this.memorizedState = null, // fiber上的所有hook链表
            this.stateNode = null, // 对应的函数组件 或者Dom节点
            this.updateQueue = null, // Effects的更新链表
            this.stateQueueTimer = null, // 用于state的合并更新(setTimeout)
            this.fiberFlags = fiberFlags, // fiber的生命周期 判断是否初始化
            // this.effectTag = undefined, //  用于标记需要执行的Effect 执行对应操作
            this.hasRef = false, //ref相关tag
            this.ref = null,
            this.children = [],
            this.props = null,
            this.tag = null, // 节点的tag 比如div/Demo
            this.text = null,
            this.sourcePool = null, ///! 组件返回的资源  props和事件
            this.hookIndex = 0, // 用于记录hook的数量 以便查找
            this.parentNode = null,
            this.nodeType = undefined,
            this.alternate = null, // 对面fiber树对应的节点
            this.$fiber = $fiber, // 用于识别fiber是哪颗树
            this.key = null; // 用于进行列表的diff
    }
}
exports.NewFiberNode = NewFiberNode;
//! -----需要使用的全局变量---------------
const global = {
    workInprogressFiberNode: null,
    workInProgressHook: { currentHook: null },
    EffectList: { firstEffect: null, lastEffect: null, length: 0 },
    destoryEffectsArr: [],
    renderTag: 'mount', // 用于判断是否是首次更新
};
exports.global = global;
//! ----------拿取需要本次update需要更新的hook----------------------
function updateWorkInProgressHook(fiber) {
    let index = fiber.hookIndex;
    let currentHook = fiber.memorizedState;
    while (currentHook && currentHook.index != index) {
        currentHook = currentHook.next;
    }
    // 因为链表是按顺序的 所以这个函数每执行一次就新增一个
    fiber.hookIndex += 1;
    return currentHook;
}
exports.updateWorkInProgressHook = updateWorkInProgressHook;


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.myUseState = void 0;
const render_1 = __webpack_require__(5);
// 全局变量和当前 Fiber
const GlobalFiber_1 = __webpack_require__(3);
//! ---------------useState返回的updater方法(updateState方法)-------------------
function dispatchAction(queue, curFiber, newVal) {
    //todo 如果newVal未发生变化不执行更新(可以用于手动强制更新)
    // const oldVal = curFiber.memorizedState.memorizedState
    // if (newVal === oldVal) return
    //todo 更新state队列(在render阶段执行)
    updateQueue(queue, newVal);
    //todo 这里使用防抖 所有queue更新完后再执行render  将timer设置在fiber上以适配Rekv
    //将多个同步setState的render合并为一个
    clearTimeout(curFiber.stateQueueTimer);
    curFiber.stateQueueTimer = setTimeout(() => {
        //! 从当前fiber节点  重新执行函数式组件  更新子fiber树(需要传入当前fiber进行递归) 
        if (typeof curFiber.stateNode === 'function') {
            const wkInFiber = curFiber.alternate;
            (0, render_1.updateRender)(curFiber.stateNode, wkInFiber, curFiber);
        }
    }, 0);
}
//! 更新setate更新队列
function updateQueue(queue, newVal) {
    //创建updater环链表 将action挂载上去
    const updater = {
        action: newVal,
        next: null
    };
    //pending上没有updater 自己形成环状链表  ; 有updater链表  插入一个updater
    if (queue.pending === null) {
        updater.next = updater;
    }
    else {
        updater.next = queue.pending.next;
        queue.pending.next = updater;
    }
    // 让此updater成为lastUpdater
    queue.pending = updater;
}
//! 创建一个useStateHook并添加到链表中------------------------
function createHook(initialState) {
    const fiber = GlobalFiber_1.global.workInprogressFiberNode; //! 测试
    // 创建useState类型的hook
    const hook = {
        hookFlags: 'mount',
        index: fiber.memorizedState ? fiber.memorizedState.index + 1 : 0,
        memorizedState: initialState,
        updateStateQueue: { pending: null },
        next: null
    };
    // 将hook添加到fiber上,且将hook链接到全局hooks链表上  成为last项
    if (!fiber.memorizedState) {
        GlobalFiber_1.global.workInProgressHook.currentHook = hook;
    }
    else {
        const lastEffect = fiber.memorizedState;
        hook.next = lastEffect;
    }
    GlobalFiber_1.global.workInProgressHook.currentHook = hook;
    fiber.memorizedState = hook;
    return hook;
}
//! 更新该Hook的memorizedState-----------------------------
function updateUseStateHook(hook) {
    // 取出更新链表上的最后一个state
    let baseState = hook.memorizedState;
    //pending保存了链表最后一项   next就指向第一个update
    if (hook.updateStateQueue.pending) {
        let firstUpdate = hook.updateStateQueue.pending.next;
        // queue链表 执行update(执行update上的action(update传入的参数 num=>num+1))  
        do {
            const action = firstUpdate.action;
            //todo 更新baseState 分为传入函数和传入newValue两种情况
            baseState = typeof action === 'function'
                ? action(baseState)
                : action;
            firstUpdate = firstUpdate.next; // 链表后移
            // 终止遍历链表
        } while (firstUpdate !== hook.updateStateQueue.pending.next);
        // 清空state更新链表
        hook.updateStateQueue.pending = null;
    }
    // 遍历结束 将更新后的baseState存放到hook.memorizedState上
    hook.memorizedState = baseState;
    return baseState;
}
//! ----------执行useState会执行state的计算过程----------------
function myUseState(initialState) {
    //todo  需要找到当前的fiber节点()
    let fiber = GlobalFiber_1.global.workInprogressFiberNode;
    //取出当前hook 如果是mount阶段就创建一个hook(初始值为initState)
    let hook;
    if (fiber.fiberFlags === 'mount') {
        hook = createHook(initialState); //创建hook 添加到hook链表
    }
    else {
        // 更新情况 找到对应的hook
        hook = (0, GlobalFiber_1.updateWorkInProgressHook)(fiber);
    }
    //todo 更新hook上保存的state
    const baseState = updateUseStateHook(hook);
    //todo 执行完useState 钩子状态变为update
    hook.hookFlags = 'update';
    //todo 返回最新的状态 和updateAction 
    //todo bind本次useState的fiber节点 用于从当前组件开始更新
    return [baseState, dispatchAction.bind(null, hook.updateStateQueue, fiber)];
}
exports.myUseState = myUseState;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


//待办项
// 将fiber树转换为二叉树
// 模拟优先级调度逻辑   拆分effect链表执行
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.resetFiber = exports.updateRender = exports.render = void 0;
//! render分为2部分  render阶段 - commit阶段  最后unmount
const GlobalFiber_1 = __webpack_require__(3);
const createFiberTree_1 = __webpack_require__(6);
const updateFiberTree_1 = __webpack_require__(9);
const Reconciler_1 = __webpack_require__(10);
//! ----------------模拟render部分------------------------
//! 更改并生成fiber树  (结束后fiber由mount变为update)
function renderPart(functionComponent, rootDom, workInProgress) {
    //todo 通过functionComponents生成第一个组件节点 如App
    const { template, resource, currentRootFiber } = firstRenderApp(functionComponent, workInProgress, rootDom);
    //todo根据组件构建fiberTree(首次)
    const fiberTree = (0, createFiberTree_1.createFiberTree)(template, resource, currentRootFiber);
    currentRootFiber.children.push(fiberTree);
    return currentRootFiber;
}
//todo 获取上一次的fiberTree 执行所有打上tag的functionComponent进行state更新 再commit   
function updateRenderPart(functionComponent, workInProgressFiber, currentFiber) {
    // 改变tag
    GlobalFiber_1.global.renderTag = 'update';
    // 处理根App节点 并链接两个节点
    const { template, resource, workInProgressRootFiber } = firstUpdateRenderApp(functionComponent, workInProgressFiber, currentFiber);
    // 更新函数组件(因为处理了根节点 从根节点的第一个子节点开始递归)
    const secondWorkInProgress = workInProgressRootFiber.children[0];
    const secondCurrent = currentFiber.children[0];
    // 此时不需要创建fiberNode  所以不需要添加childFiber  直接在根fiber树上更新
    const childFiber = (0, updateFiberTree_1.updateFiberTree)(template, resource, workInProgressRootFiber, secondWorkInProgress, secondCurrent);
    if (workInProgressRootFiber.children.length === 0) {
        workInProgressRootFiber.children = [childFiber];
    }
    return workInProgressRootFiber;
}
//todo修补用工具函数对render根Fiber节点进行处理(否则无法渲染第一个根节点)
function firstRenderApp(functionComponent, currentRootFiber, rootDom) {
    GlobalFiber_1.global.workInprogressFiberNode = currentRootFiber;
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
function firstUpdateRenderApp(functionComponent, workInProgressRootFiber, currentRootFiber) {
    if (!workInProgressRootFiber) {
        workInProgressRootFiber = firstCreateAlternate(currentRootFiber);
    }
    GlobalFiber_1.global.workInprogressFiberNode = workInProgressRootFiber;
    workInProgressRootFiber.stateNode = functionComponent;
    //! 用于解决webpack 函数名出现bound问题
    const functionNameArr = functionComponent.name.split(' ');
    let functionName = functionNameArr[0] === 'bound'
        ? functionNameArr[1]
        : functionNameArr[0];
    workInProgressRootFiber.tag = functionName;
    const { template, data, components } = functionComponent();
    const resource = { data, components };
    return { template, resource, workInProgressRootFiber };
}
function firstCreateAlternate(currentRootFiber) {
    //todo 新建一个fiberNode
    const workInProgressRootFiber = new GlobalFiber_1.NewFiberNode('update', '$2');
    //! 复制一些通用属性
    workInProgressRootFiber.stateQueueTimer = currentRootFiber.stateQueueTimer;
    workInProgressRootFiber.updateQueue = currentRootFiber.updateQueue;
    workInProgressRootFiber.hookIndex = currentRootFiber.hookIndex;
    workInProgressRootFiber.memorizedState = currentRootFiber.memorizedState;
    workInProgressRootFiber.nodeType = currentRootFiber.nodeType;
    //! 合并两个节点
    workInProgressRootFiber.alternate = currentRootFiber;
    currentRootFiber.alternate = workInProgressRootFiber;
    return workInProgressRootFiber;
}
//! -----------------模拟Commit阶段-----------------------------
//! 分为三部分  beforeMutation  mutation  layout阶段
//! before 前置处理  mutation 渲染dom节点   layout  处理useEffect useLayoutEffect
function commitPart(finishedWorkFiber) {
    beforeMutation(finishedWorkFiber); // beforeMutation阶段
    commitFiberNodeMutation(GlobalFiber_1.global.EffectList); //  mutation阶段 
    //todo  layout阶段  调用Effects链表 执行create函数()
    //todo 处理ref
}
function updateCommitPart(finishedWorkFiber) {
    beforeMutation(finishedWorkFiber); // beforeMutation阶段
    commitFiberNodeMutation(GlobalFiber_1.global.EffectList); // mutation阶段 
    //todo  layout阶段  调用Effects链表 执行create函数()
    //todo 处理ref
}
//! beforeMutation阶段 (将收集好的useEffect生成一个Effect 推入链表)
function beforeMutation(finishedWorkFiber) {
    (0, Reconciler_1.reconcileUseEffect)(finishedWorkFiber, null);
}
//! mutation阶段  遍历EffectList  对每个节点执行更新(分为添加  删除  更新 三大部分 )
//todo 遍历EffectList单链表 预留优先级调用 更新fiber
function commitFiberNodeMutation(EffectList, lane) {
    console.log('本次更新的EffectList', EffectList);
    let currentEffect = EffectList.firstEffect;
    // TODO 在这里将effect循环用requestAnimationFrame抱起来执行中断
    while (currentEffect !== null) {
        let effectTag = currentEffect.tag;
        let targetFiber = currentEffect.targetFiber;
        //! 经过相应处理 最后执行commitWork方法
        switch (effectTag) {
            case 'Placement': //todo  添加
                commitPlacement(targetFiber);
                break;
            case 'Delete': //todo  删除
                commitDeletion(targetFiber);
                break;
            case 'Update': //todo  更新
                commitUpdate(targetFiber);
                break;
            case 'UseEffect': //todo 调用了useEffect钩子
                commitUpdate(targetFiber);
            default:
                // commitUpdate(targetFiber) //todo 处理更新链表(effect链表和其他的effect应该是在一起的)
                break;
        }
        currentEffect = currentEffect.next;
    }
}
//todo 待完成 插入dom节点
function commitPlacement(finishedWorkFiber) {
    (0, createFiberTree_1.createDomElement)(finishedWorkFiber);
}
// todo 不同类型的fiberNode执行不同的更新 (在这里处理useEffect链表)
function commitUpdate(finishedWorkFiber) {
    const fiberType = finishedWorkFiber.nodeType;
    switch (fiberType) {
        //todo 函数组件 处理effects链表  
        case 'FunctionComponent':
            //遍历effect更新链表  执行每个上一次的destory和本次create,并挂载destory
            //在之前finishedWork阶段已经将所有effects收集 挂载到finishedWorkFiber上
            callDestoryAndUnmountDestoryList(finishedWorkFiber);
            callCreateAndMountDestoryList(finishedWorkFiber);
            break;
        //todo App根组件 处理effects链表  
        case 'AppNode':
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
// todo 删除多余的currentFiber和dom节点
function commitDeletion(currentFiber) {
    // 删除dom节点
    const dom = currentFiber.stateNode;
    if (typeof dom !== 'function') {
        dom.remove();
    }
    //从父节点处遍历删除该节点
    const parentNode = currentFiber.parentNode;
    parentNode.children.forEach((childNode, index) => {
        if (childNode === currentFiber) {
            parentNode.children.splice(index, 1);
        }
    });
}
//todo 记录  我这里直接遍历fiber树  发现有需要变更的节点直接进行变更,
//todo 而react中在render阶段遍历 发现变更 打上tag  生成update , 推入effect链表中  为了实现优先级调度
// 错误记录 : 赋值dom节点新的text后   没有handleProps   
// 因为新的click函数的获取在这里   如果不执行  每次点击执行的都是上一次的点击事件 
// 所以不更新视图
// todo dom节点的更新
function commitUpdateDom(finishedWorkFiber) {
    const domElement = finishedWorkFiber.stateNode;
    if (typeof domElement === 'function')
        return;
    diffProps(finishedWorkFiber, domElement);
}
//TODO text节点的更新
function commitUpdateText(finishedWorkFiber) {
    const domElement = finishedWorkFiber.stateNode;
    if (typeof domElement === 'function')
        return;
    // 这里更改的是dom.firstChild  会新建一个nodeValue
    //! 注意 这里需要处理props  不然点击事件不会更新  第二次点击num不会++  
    //! 点击时获取的num变量还是上一次的变量
    diffProps(finishedWorkFiber, domElement);
    // ! 比较text是否变化 变化则更改dom
    let fiberText = finishedWorkFiber.text;
    let domText = domElement.firstChild.nodeValue;
    if (domText !== fiberText) {
        console.log('更新text');
        domElement.firstChild.nodeValue = fiberText;
    }
}
//! 对标签中的属性进行diff处理 (使用前后两棵fiber树进行diff)
function diffProps(curFiber, dom) {
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
                dom.onclick = callback; // 这里不能使用addEventListener  因为需要删除上一个点击事件
                break;
            //todo  处理其他
            default:
                dom.setAttribute(key, value[0]);
                break;
        }
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
            callDestoryByTag(currentEffect);
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
            callCreateByTag(currentEffect);
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
//! ----------遍历fiber  收集effect 挂载到本次root节点 识别删除节点------------------
function finishedWork(workInProgressFiber, currentFiber) {
    // 遍历fiber树 将所有Effect添加进root节点的update环链表中
    //TODO  这里相当于重置了updateQueue
    const root = workInProgressFiber;
    let rootUpdateQueue = { lastEffect: null };
    // 首屏不需要diff  更新需要进行diff计算
    GlobalFiber_1.global.renderTag === 'mount'
        ? finishedWorkLoop(workInProgressFiber, rootUpdateQueue)
        : updateFinishedWorkLoop(workInProgressFiber, currentFiber, rootUpdateQueue);
    // 处理好的updateQueue成为到本次root节点的updateQueue
    root.updateQueue = rootUpdateQueue;
    return root;
}
//! 遍历fiber  拼接所有的effect   
function finishedWorkLoop(workInProgressFiber, rootUpdateQueue) {
    // 拼接两个链表
    collectEffect(workInProgressFiber, rootUpdateQueue);
    // 继续遍历fiber树  拼接链表
    const wkChildren = workInProgressFiber.children;
    for (let i = 0; i < wkChildren.length; i++) {
        finishedWorkLoop(wkChildren[i], rootUpdateQueue);
    }
}
//! 更新时的finishedWork
function updateFinishedWorkLoop(workInProgressFiber, currentFiber, rootUpdateQueue) {
    // 拼接两个链表
    collectEffect(workInProgressFiber, rootUpdateQueue);
    //TODO ---------diff两个节点 打上tag 生成Effect交给commit阶段更新------------
    (0, Reconciler_1.reconcileFiberNode)(workInProgressFiber, currentFiber);
    // 遍历fiber树 (最长遍历) (需要注意fiber为null的情况)
    let length;
    let wkChildren = [];
    let curChildren = [];
    if (workInProgressFiber && currentFiber) {
        wkChildren = workInProgressFiber.children;
        curChildren = currentFiber.children;
        length = wkChildren.length > curChildren.length
            ? wkChildren.length : curChildren.length;
    }
    else if (!workInProgressFiber) {
        curChildren = currentFiber.children;
        length = currentFiber.children.length;
    }
    else if (!currentFiber) {
        wkChildren = workInProgressFiber.children;
        length = workInProgressFiber.children.length;
    }
    // 继续遍历fiber树  拼接链表
    for (let i = 0; i < length; i++) {
        updateFinishedWorkLoop(wkChildren[i], curChildren[i], rootUpdateQueue);
    }
}
//! 收集所有的Effect(hook)
function collectEffect(fiber, rootUpdateQueue) {
    if (!fiber)
        return;
    const fiberUpdateQueue = fiber.updateQueue;
    if (fiberUpdateQueue && fiberUpdateQueue.lastEffect) {
        rootUpdateQueue.lastEffect = fiberUpdateQueue.lastEffect;
        fiberUpdateQueue.lastEffect.next = rootUpdateQueue.lastEffect.next;
    }
}
//!--------------综合Render方法-------------------
function render(functionComponent, rootDom) {
    console.log('------------render-------------');
    //todo 初始化workInProgress树
    const workInProgressFiber = new GlobalFiber_1.NewFiberNode('mount', '$1');
    GlobalFiber_1.global.workInprogressFiberNode = workInProgressFiber; //挂载到全局
    //todo render阶段
    const beginWorkFiber = renderPart(functionComponent, rootDom, workInProgressFiber);
    // 从下往上遍历fiber收集所有的Effects 形成环链表 上传递优先级给root
    //! 这里finishedWork应该在renderPart中   待修改
    const finishedWorkFiber = finishedWork(beginWorkFiber, null);
    //todo commit阶段
    commitPart(finishedWorkFiber);
}
exports.render = render;
function updateRender(functionComponent, workInProgressFiber, currentFiber) {
    console.log('------------updateRender-------------');
    resetFiber(currentFiber); //更新render时需要先将fiber的数据重置  重新挂载数据
    if (workInProgressFiber) {
        resetFiber(workInProgressFiber); //更新render时需要先将fiber的数据重置  重新挂载数据
    }
    // 更新fiber树
    const beginWorkFiber = updateRenderPart(functionComponent, workInProgressFiber, currentFiber);
    // 从下往上遍历fiber收集所有的Effects 形成环链表 上传递优先级给root
    const finishedWorkFiber = finishedWork(beginWorkFiber, currentFiber);
    updateCommitPart(finishedWorkFiber);
}
exports.updateRender = updateRender;
//todo ----遍历清空fiber树上的hookIndex 和 queue 和 EffectTag
function resetFiber(fiber) {
    fiber.hookIndex = 0;
    fiber.updateQueue = null;
    GlobalFiber_1.global.EffectList = { firstEffect: null, lastEffect: null, length: 0 };
    GlobalFiber_1.global.destoryEffectsArr = [];
    if (fiber.children.length !== 0) {
        fiber.children.forEach((fiber) => {
            resetFiber(fiber);
        });
    }
}
exports.resetFiber = resetFiber;
//! --------------废弃部分   handleProps 和 createElement放在了createFiber文件中----------------
// {
//     //! (从更新的rootDom处开始)根据fiberTree创建html
//     function updateHtml(fiber: any, rootDom: HTMLBodyElement) {
//         //todo 深度优先递归children 从dom下一层渲染子dom节点
//         fiber.children.forEach((fiber: any) => {
//             createHtml(fiber, rootDom)
//         });
//     }
//     function createHtml(fiber: any, rootDom: HTMLBodyElement) {
//         //不同的tag标签创建不同的html标签
//         let dom = document.createElement(fiber.tag)
//         //todo 如果是组件节点   挂载ref
//         if (fiber.tag[0] === fiber.tag[0].toUpperCase()) {
//             dom = document.createElement('fc-' + fiber.tag)
//             fiber.ref = dom
//             //todo 如果是小写 判断为html标签 填充文本 处理属性
//         }
//         else {
//             handleProps(fiber, dom)
//             if (fiber.text) { dom.innerHTML = fiber.text }
//         }
//         //todo 深度优先递归children 从dom开始渲染子dom节点
//         fiber.children.forEach((fiber: any) => {
//             createHtml(fiber, dom)
//         });
//         rootDom.appendChild(dom)
//     }
//     //! 遍历树获取所有的Effect(执行create和生成destory函数数组)
//     function handleEffect(fiber: FiberNode) {
//         let destoryEffectsArr: Effect[] = []
//         if (fiber.updateQueue) {
//             const createEffectsArr = createCallbackQueue(fiber)
//             destoryEffectsArr = doCreateQueue(createEffectsArr)
//         }
//         if (fiber.children.length !== 0) {
//             fiber.children.forEach((fiber) => {
//                 handleEffect(fiber)
//             })
//         }
//         global.destoryEffectsArr.push(...destoryEffectsArr)
//     }
//     //todo 遍历Effect链表 将需要执行的Effect推入数组--------------
//     function createCallbackQueue(fiber: FiberNode) {
//         const createEffectsArr: Effect[] = []
//         const lastEffect = fiber.updateQueue.lastEffect
//         const firstEffect = lastEffect.next
//         let currentEffect = firstEffect
//         do {
//             //判断effectTag决定是否执行Effect(mount和dep变更时执行)
//             //React底层通过二进制来打tag
//             const isFiberMount = Boolean(global.renderTag === 'mount')
//             const isDepChange = Boolean(currentEffect.tag === 'depChanged')
//             const isNullDeps = Boolean(currentEffect.tag === 'nullDeps')
//             const isNoDeps = Boolean(currentEffect.tag === 'noDeps')
//             //根据不同情况 将Effect推入数组  达到不同的useEffect的效果
//             if (isFiberMount || isDepChange || isNullDeps) {
//                 createEffectsArr.push(currentEffect)
//             } else if (isFiberMount && isNoDeps) {
//                 createEffectsArr.push(currentEffect)
//             }
//             currentEffect = currentEffect.next
//         } while (currentEffect !== firstEffect)
//         return createEffectsArr
//     }
//     //todo 遍历执行需要执行的Effect---生成destory---------
//     function doCreateQueue(createEffectsArr: Effect[]) {
//         const destoryEffectsArr: Effect[] = []
//         //todo 遍历Effects数组 执行create
//         //todo 生成destoryEffect数组 将destory存放到对应的Effect上
//         for (let i = 0; i < createEffectsArr.length; i++) {
//             const destory = createEffectsArr[i].create() // 执行create
//             if (destory) {
//                 createEffectsArr[i].destory = destory // 赋值destory
//                 destoryEffectsArr.push(createEffectsArr[i])   //推入destory数组
//             }
//         }
//         return destoryEffectsArr
//     }
// }
// this.jql += ` AND description ~ ${keyword[0]}`; // 描述查询
// this.jql += ` OR issuekey = ${keyword[0]}`; // ID查询


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handleFunctionFiberNode = exports.preHandleFiberNode = exports.conbineVnodAndFiber = exports.getParentDom = exports.createDomElement = exports.handleFunctionComponentProps = exports.handleProps = exports.useRoute = exports.renderFunctionComponent = exports.createFiberTree = void 0;
const tplToVnode_1 = __webpack_require__(7);
const GlobalFiber_1 = __webpack_require__(3);
//! 创建fiberNode树(Vnode树) 深度优先遍历vnode树  包装成fiberNode
//! 根据fiberNode和FunctionComponent创建FiberNode 生成Fiber树
//todo 传入parentNode 给子fiber挂载parentNode属性  用于向上查找dom节点和fiber
function createFiberTree(source, resources, parentNode) {
    //todo 创建一个新的fiber节点(浅拷贝) 更新当前工作节点
    let newFiberNode = new GlobalFiber_1.NewFiberNode('mount', '$1');
    //todo 预处理Fiber  生成vnode 挂载resource
    const { children, tag } = preHandleFiberNode(source, resources, newFiberNode);
    //todo 挂载父节点
    newFiberNode.parentNode = parentNode;
    //TODO -----------如果tag大写 解析为组件节点(无children) ----------------
    if (tag[0] === tag[0].toUpperCase()) {
        //! 处理为组件节点   并继续向下递归render子函数组件
        handleFunctionFiberNode(newFiberNode, tag);
        renderFunctionComponent(newFiberNode);
    }
    //TODO ----------小写的情况  是domComponent节点/text节点  创建对应的dom并添加--------
    else {
        newFiberNode.nodeType = 'HostText';
        createDomElement(newFiberNode);
    }
    //todo 继续向下深度优先递归  创建子fiber 挂到当前节点
    createFiberTreeLoop(children, newFiberNode);
    newFiberNode.fiberFlags = 'update';
    //模拟finishowrk
    // console.log('finishWork', newFiberNode.tag);
    //适配路由
    useRoute(newFiberNode);
    return newFiberNode;
}
exports.createFiberTree = createFiberTree;
//! 根据子vnode 递归创建子fiberNode 并进行拼接-------------
function createFiberTreeLoop(childVnodes, parentNode) {
    if (childVnodes.length > 0) {
        parentNode.nodeType = 'HostComponent';
        for (let i = 0; i < childVnodes.length; i++) {
            const childFiberNode = createFiberTree(childVnodes[i], parentNode.sourcePool, parentNode);
            parentNode.children.push(childFiberNode);
        }
    }
}
//! -----------------render子函数组件-----------------------
function renderFunctionComponent(fiber) {
    if (typeof fiber.stateNode !== 'function')
        return;
    const { template, data, components } = fiber.stateNode();
    const childFiberNode = createFiberTree(template, { data, components }, fiber);
    //todo 生成子树并链接
    fiber.children = [childFiberNode];
}
exports.renderFunctionComponent = renderFunctionComponent;
//! -------------创建html并挂载到fiber节点上--------------------
function createDomElement(fiber) {
    //找到父dom节点 将创建好的dom节点添加进去
    const parentDom = getParentDom(fiber);
    let domElement = document.createElement(fiber.tag);
    handleProps(fiber, domElement);
    if (fiber.text) {
        domElement.innerHTML = fiber.text;
    }
    parentDom.appendChild(domElement);
    fiber.stateNode = domElement;
    return domElement;
}
exports.createDomElement = createDomElement;
//! 预处理FiberNode  将模板和资源先挂载到节点上-----------------
function preHandleFiberNode(source, resources, workInProgressFiber) {
    //todo 切换当前工作fiber
    GlobalFiber_1.global.workInprogressFiberNode = workInProgressFiber;
    //todo 判断传入的source 转换成vnode
    let vnode = typeof source === 'string' ? (0, tplToVnode_1.tplToVDOM)(source) : source;
    //todo 合并处理vnode和Fiber 挂载resource
    const { children = [], tag } = vnode;
    conbineVnodAndFiber(workInProgressFiber, vnode, resources);
    return { children, tag };
}
exports.preHandleFiberNode = preHandleFiberNode;
//! 处理函数组件节点
function handleFunctionFiberNode(fiber, ComponentName) {
    fiber.nodeType = 'FunctionComponent';
    //todo 从sourcePool中获取子组件
    const fc = fiber.sourcePool.components[ComponentName];
    if (!fc) {
        console.error(`子组件${ComponentName}未注册`);
    }
    //! 从资源池中拿取需要的props，给子函数组件绑定需要的props,并挂载子函数组件到fiber上
    handleFunctionComponentProps(fiber, fc);
}
exports.handleFunctionFiberNode = handleFunctionFiberNode;
//! ----------合并vnode和fiber 处理key 挂载resource-----------
function conbineVnodAndFiber(fiber, vnode, resources) {
    const { props, tag, text } = vnode;
    fiber.props = props;
    fiber.tag = tag;
    fiber.text = text;
    fiber.sourcePool = resources;
    //单独对key进行处理
    if (props.key) {
        const key = props.key[0] - 0;
        fiber.key = key;
    }
}
exports.conbineVnodAndFiber = conbineVnodAndFiber;
//! ----------找到父dom节点---------------------
function getParentDom(fiber) {
    let parentNode = fiber.parentNode;
    let parentDom = parentNode.stateNode;
    if (!parentNode) {
        return document.getElementById('root');
    }
    while (typeof parentDom === 'function') {
        parentNode = parentNode.parentNode;
        if (!parentNode) {
            return document.getElementById('root');
        }
        parentDom = parentNode.stateNode;
    }
    return parentDom;
}
exports.getParentDom = getParentDom;
//! ------------从资源池中拿取子组件需要的Props 处理后传递给子组件----------
//! 将props设置为单向数据流   并返回处理好的子组件函数传递出去
function handleFunctionComponentProps(fiber, functionComponent) {
    const needProps = fiber.props;
    const data = fiber.sourcePool.data;
    //否则对其他组件进行处理
    const nextProps = {};
    for (let key in needProps) {
        const originValue = needProps[key][0];
        let value;
        //! 对传入的props进行数据类型解析
        if (data[originValue]) { //从需求池中找到了对应的数据
            value = data[originValue];
        }
        else if (!isNaN((originValue - 0))) { //传入数字
            value = originValue - 0;
        }
        else if (originValue[0] === '"' || originValue[0] === "'") { //传入字符串
            value = originValue.slice(1, originValue.length - 1).trim();
        }
        else { // 传入普通字符串
            value = originValue;
        }
        nextProps[key] = value;
    }
    //todo 使用Objdect.defineoroperty包装props为只读(get set方法)
    //todo 定义一个新对象  添加对应的属性并添加描述器get set 
    const newProps = {};
    for (let key in nextProps) {
        let val = nextProps[key]; // 设置该属性的初始值
        Object.defineProperty(newProps, key, {
            get: () => val,
            set: (newVal) => {
                console.warn('您正在尝试修改props, 不推荐此操作, 请保证数据单向流动');
                val = newVal; // 修改时修改属性
            }
        });
    }
    //给函数组件绑定newProps  挂载到fiber上
    const newFc = functionComponent.bind(null, newProps);
    fiber.stateNode = newFc;
    return newFc;
}
exports.handleFunctionComponentProps = handleFunctionComponentProps;
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
                dom.onclick = callback;
                break;
            //todo  处理其他
            default:
                dom.setAttribute(key, value[0]);
                break;
        }
    }
}
exports.handleProps = handleProps;
//! -------路由适配方法  待修改---------------------
function useRoute(fiber) {
    //todo  如果是Route组件 将container的fiber传递给子组件 (暂时放到全局)
    if (fiber.tag === 'RouteContainer') {
        window.$$routeContainerFiber = fiber;
    }
}
exports.useRoute = useRoute;
// 错误记录
// 函数name被webpack打包后会变为bound+函数名
// 不能直接给tag赋值 
//! -------------废弃部分------------------------------
{
    // //这个应该在commit阶段执行
    // function updateDomElement(fiber: FiberNode) {
    //     let domElement = fiber.stateNode
    //     handleProps(fiber, domElement)
    //     if (fiber.text) { domElement.innerHTML = fiber.text }
    //     return domElement
    // }
}


/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.tokens2vdom = exports.nestTokens = exports.collectTokens = exports.tplToVDOM = void 0;
const tplScanner_1 = __importDefault(__webpack_require__(8));
//! 拆分html中的事件  (键值对)
function eventParser(html) {
    const jsEXP = /\w*\={{([\s\S]*?)}*}/;
    let newHtml = html;
    const event = {};
    //todo 没有检测到事件直接退出
    if (!jsEXP.test(html))
        return { newHtml, event };
    //TODO  循环拆离里面所有的JS语法 转换成键值对  
    const kvArr = [];
    let kv = [];
    while (kv) {
        kv = jsEXP.exec(newHtml);
        if (kv) {
            kvArr.push(kv[0]);
            newHtml = newHtml.replace(kv[0], '');
        }
    }
    //todo 将键值对数组拆分保存到event对象中
    kvArr.forEach((item) => {
        //删去最后两个}} 根据={{拆分成key value
        let newItem = item.slice(0, item.length - 2);
        const arr = newItem.split('={{');
        //todo 使用eval将函数字符串转化为可执行的函数
        let val = eval("(" + arr[1] + ")");
        event[arr[0]] = val;
    });
    return { newHtml, event };
}
//! 拆分html中的属性  (键值对)
function allPropsParser(html) {
    //todo 正则适配
    // const classEXP = /\w*\="([\s\S]*?)"/
    const classEXP = /[\w-]*="([\s\S]*?)"/; //! 包括横杠类名
    const singleEXP = /\w*\='([\s\S]*?)'/;
    const eventEXP = /\w*\={([\s\S]*?)}/;
    //todo 将中间多个空格合并为一个
    let newHtml2 = html.replace(/ +/g, ' ');
    const props = {};
    //todo 没有检测到事件直接退出
    const hasProps = classEXP.test(html) || singleEXP.test(html) || eventEXP.test(html);
    if (!hasProps)
        return { newHtml2, props };
    //TODO  循环拆离里面所有的JS语法 转换成键值对  
    const kvArr = [];
    let kv = [];
    while (kv) {
        kv = classEXP.exec(newHtml2) ||
            singleEXP.exec(newHtml2) ||
            eventEXP.exec(newHtml2);
        if (kv) {
            kvArr.push(kv[0]);
            newHtml2 = newHtml2.replace(kv[0], '');
        }
    }
    //todo 将键值对数组拆分保存到event对象中
    kvArr.forEach((item) => {
        let kv = item.split('='); //从等号拆分
        const k = kv[0]; //对key value进行处理
        const v = kv[1].slice(1, kv[1].length - 1).split(' ');
        props[k] = v; //赋值给对象
    });
    return { newHtml2, props };
}
//! 将html模板字符串转换成tokens数组
function collectTokens(html) {
    const scanner = new tplScanner_1.default(html);
    const tokens = [];
    let word = '';
    while (!scanner.eos()) {
        // 扫描文本
        const text = scanner.scanUntil('<');
        scanner.scan('<');
        tokens[tokens.length - 1] && tokens[tokens.length - 1].push(text);
        // 扫描标签<>中的内容
        word = scanner.scanUntil('>');
        scanner.scan('>');
        // 如果没有扫描到值，就跳过本次进行下一次扫描
        if (!word)
            continue;
        //todo 对本次扫描的字符串进行事件处理
        const { newHtml, event } = eventParser(word); //todo 拆分事件
        word = newHtml;
        const { newHtml2, props } = allPropsParser(word); //todo 拆分事件
        word = newHtml2;
        // 区分开始标签 # 和结束标签 /
        if (word.startsWith('/')) {
            tokens.push(['/', word.slice(1)]);
        }
        else {
            //todo 如果有属性存在，则解析属性 (且将event添加进去)
            const firstSpaceIdx = word.indexOf(' ');
            if (firstSpaceIdx === -1) {
                tokens.push(['#', word, Object.assign(Object.assign({}, event), props),]);
            }
            else {
                // 解析属性
                tokens.push(['#', word.slice(0, firstSpaceIdx), Object.assign(Object.assign({}, event), props)]);
            }
        }
    }
    return tokens;
}
exports.collectTokens = collectTokens;
//! 将tokens数组形成dom树形结构
function nestTokens(tokens) {
    const nestedTokens = [];
    const stack = [];
    let collector = nestedTokens;
    for (let i = 0, len = tokens.length; i < len; i++) {
        const token = tokens[i];
        switch (token[0]) {
            case '#':
                // 收集当前token
                collector.push(token);
                // 压入栈中
                stack.push(token);
                // 由于进入了新的嵌套结构，新建一个数组保存嵌套结构
                // 并修改collector的指向
                token.splice(2, 0, []);
                collector = token[2];
                break;
            case '/':
                // 出栈
                stack.pop();
                // 将收集器指向上一层作用域中用于存放嵌套结构的数组
                collector = stack.length > 0
                    ? stack[stack.length - 1][2]
                    : nestedTokens;
                break;
            default:
                collector.push(token);
        }
    }
    return nestedTokens;
}
exports.nestTokens = nestTokens;
//! 将tokens树转化为虚拟dom树
function tokens2vdom(tokens) {
    const vdom = {};
    for (let i = 0, len = tokens.length; i < len; i++) {
        const token = tokens[i];
        vdom['tag'] = token[1];
        vdom['props'] = token[3];
        if (token[4]) {
            vdom['text'] = token[token.length - 1];
        }
        else {
            vdom['text'] = undefined;
        }
        const children = token[2];
        if (children.length === 0) {
            vdom['children'] = undefined;
            continue;
        }
        ;
        vdom['children'] = [];
        for (let j = 0; j < children.length; j++) {
            vdom['children'].push(tokens2vdom([children[j]]));
        }
        if (vdom['children'].length === 0) {
            delete vdom['children'];
        }
    }
    return vdom;
}
exports.tokens2vdom = tokens2vdom;
//! 总和方法 转换html模板为虚拟dom
function tplToVDOM(html) {
    const tokensArr = collectTokens(html);
    const tokensTree = nestTokens(tokensArr);
    const vdom = tokens2vdom(tokensTree);
    return vdom;
}
exports.tplToVDOM = tplToVDOM;


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
//! 字符串扫描解析器
class Scanner {
    constructor(text) {
        this.text = text;
        // 指针
        this.pos = 0;
        // 尾巴  剩余字符
        this.tail = text;
    }
    /**
     * 路过指定内容
     *
     * @memberof Scanner
     */
    scan(tag) {
        if (this.tail.indexOf(tag) === 0) {
            // 直接跳过指定内容的长度
            this.pos += tag.length;
            // 更新tail
            this.tail = this.text.substring(this.pos);
        }
    }
    /**
     * 让指针进行扫描，直到遇见指定内容，返回路过的文字
     *
     * @memberof Scanner
     * @return str 收集到的字符串
     */
    scanUntil(stopTag) {
        // 记录开始扫描时的初始值
        const startPos = this.pos;
        // 当尾巴的开头不是stopTg的时候，说明还没有扫描到stopTag
        while (!this.eos() && this.tail.indexOf(stopTag) !== 0) {
            // 改变尾巴为当前指针这个字符到最后的所有字符
            this.tail = this.text.substring(++this.pos);
        }
        // 返回经过的文本数据
        return this.text.substring(startPos, this.pos).trim();
    }
    /**
     * 判断指针是否到达文本末尾（end of string）
     *
     * @memberof Scanner
     */
    eos() {
        return this.pos >= this.text.length;
    }
}
exports["default"] = Scanner;


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createAlternate = exports.updateFiberTree = void 0;
const GlobalFiber_1 = __webpack_require__(3);
const createFiberTree_1 = __webpack_require__(6);
//! ---------------更新fiberTree (在这里生成第二棵fiberTree)-------------------
function updateFiberTree(source, resources, parentNode, workInProgressFiber, currentFiber) {
    // 添加节点逻辑
    if (!currentFiber) {
        const placementFiber = placementFiberTree(source, resources, parentNode);
        return placementFiber;
    }
    // 如果没有  生成一个alternate链接上去 
    if (!workInProgressFiber) {
        workInProgressFiber = createAlternate(currentFiber);
    }
    //todo 预处理Fiber  生成vnode 挂载resource
    const { children, tag } = (0, createFiberTree_1.preHandleFiberNode)(source, resources, workInProgressFiber);
    //todo 挂载parentNode
    workInProgressFiber.parentNode = parentNode;
    //TODO -----------如果tag大写 解析为组件 ----------------
    if (tag[0] === tag[0].toUpperCase()) {
        //! 处理为组件节点
        (0, createFiberTree_1.handleFunctionFiberNode)(workInProgressFiber, tag);
        // ! 函数节点执行函数并继续向下更新fiberTree
        updateRenderFunctionComponent(workInProgressFiber, currentFiber);
    }
    //TODO ----------小写的情况  是domComponent节点/text节点 挂载dom节点--------
    else {
        workInProgressFiber.nodeType = 'HostText';
        workInProgressFiber.stateNode = currentFiber.stateNode;
    }
    //todo 如果有children 深度优先遍历  
    if (children.length > 0) {
        workInProgressFiber.nodeType = 'HostComponent';
        updateFiberTreeLoop(children, workInProgressFiber, currentFiber);
    }
    //适配路由
    (0, createFiberTree_1.useRoute)(workInProgressFiber);
    return workInProgressFiber;
}
exports.updateFiberTree = updateFiberTree;
//! 根据子vnode 递归更新子fiberNode 并进行拼接-------------
function updateFiberTreeLoop(childVnodes, workInProgressFiber, currentFiber) {
    //删除节点的情况  将workInprogress之前多出的节点删除
    if (workInProgressFiber.children.length > childVnodes.length) {
        const position = childVnodes.length;
        workInProgressFiber.children.splice(position);
    }
    for (let i = 0; i < childVnodes.length; i++) {
        //! 当map添加item时  可能造成vnode和childrenFiber数量不等
        //! 如果发现没有此fiber 就再根据vnode创建一个fiber
        const vnode = childVnodes[i];
        const resources = workInProgressFiber.sourcePool;
        //todo 这里发现有添加节点的情况创建了 fiberNode          
        let childWkFiber = workInProgressFiber.children[i];
        let childCurFiebr = currentFiber.children[i];
        //todo 有则创建子节点 进行拼接 无则直接遍历更新
        if (childWkFiber) {
            updateFiberTree(vnode, resources, workInProgressFiber, childWkFiber, childCurFiebr);
        }
        else {
            workInProgressFiber.children[i] = updateFiberTree(vnode, resources, workInProgressFiber, childWkFiber, childCurFiebr);
        }
    }
}
//! -----------------update子函数组件-----------------------
function updateRenderFunctionComponent(workInProgressFiber, currentFiber) {
    //处理函数组件  执行函数获得新的数据  往下传递 继续向下递归
    if (typeof workInProgressFiber.stateNode !== 'function')
        return;
    const { template, data = {}, components = {} } = workInProgressFiber.stateNode();
    //todo继续让子fiber向下递归更新
    let childWkFiber = workInProgressFiber.children[0];
    let childCurFiebr = currentFiber.children[0];
    const resources = { data, components };
    //todo 如果没有子节点  那么需要在这里链接父子树  或者直接向下遍历更新
    if (!childWkFiber) {
        workInProgressFiber.children = [updateFiberTree(template, resources, workInProgressFiber, childWkFiber, childCurFiebr)];
    }
    else {
        updateFiberTree(template, resources, workInProgressFiber, childWkFiber, childCurFiebr);
    }
}
//! 创建Placement的fiberNode  类似createFiberTree
function placementFiberTree(source, resources, parentNode) {
    //todo 创建一个新的fiber节点(浅拷贝) 更新当前工作节点
    let newFiberNode = new GlobalFiber_1.NewFiberNode('mount', parentNode.$fiber);
    //todo 预处理Fiber  生成vnode 挂载resource
    const { children, tag } = (0, createFiberTree_1.preHandleFiberNode)(source, resources, newFiberNode);
    //todo 挂载父节点
    newFiberNode.parentNode = parentNode;
    //TODO -----------如果tag大写 解析为组件节点(无children) ----------------
    if (tag[0] === tag[0].toUpperCase()) {
        //! 处理为组件节点   并继续向下递归render子函数组件
        (0, createFiberTree_1.handleFunctionFiberNode)(newFiberNode, tag);
        placementFunctionComponent(newFiberNode);
    }
    //TODO ----------小写的情况  是dom节点 创建Effect 交给commit阶段执行添加--------
    else {
        newFiberNode.nodeType = 'HostText';
    }
    //todo 继续向下深度优先递归  创建子fiber 挂到当前节点
    placementFiberTreeLoop(children, newFiberNode);
    newFiberNode.fiberFlags = 'update';
    //适配路由
    (0, createFiberTree_1.useRoute)(newFiberNode);
    //todo 在这里创建一个effect!
    return newFiberNode;
}
//! 根据子vnode 递归创建创建Placement的fiberNode 并进行拼接-------------
function placementFiberTreeLoop(childVnodes, parentNode) {
    if (childVnodes.length > 0) {
        parentNode.nodeType = 'HostComponent';
        for (let i = 0; i < childVnodes.length; i++) {
            const childFiberNode = placementFiberTree(childVnodes[i], parentNode.sourcePool, parentNode);
            parentNode.children.push(childFiberNode);
        }
    }
}
//! 添加函数组件节点
function placementFunctionComponent(fiber) {
    if (typeof fiber.stateNode !== 'function')
        return;
    const { template, data = {}, components = {} } = fiber.stateNode();
    const childFiberNode = placementFiberTree(template, { data, components }, fiber);
    //todo 生成子树并链接
    fiber.children = [childFiberNode];
}
//! ---------创建Fiber替代并链接----------
function createAlternate(currentFiber) {
    //todo 新建一个fiberNode
    const workInProgressFiber = new GlobalFiber_1.NewFiberNode('update', '$2');
    //! 将一些属性复制给workInProgress
    workInProgressFiber.stateQueueTimer = currentFiber.stateQueueTimer;
    workInProgressFiber.updateQueue = currentFiber.updateQueue;
    workInProgressFiber.hookIndex = currentFiber.hookIndex;
    workInProgressFiber.memorizedState = currentFiber.memorizedState;
    workInProgressFiber.nodeType = currentFiber.nodeType;
    //! 链接两个fiber 
    workInProgressFiber.alternate = currentFiber;
    currentFiber.alternate = workInProgressFiber;
    return workInProgressFiber;
}
exports.createAlternate = createAlternate;


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.reconcileUseEffect = exports.reconcileFiberNode = void 0;
const GlobalFiber_1 = __webpack_require__(3);
//! 更新事件
function reconcileEvent(workInProgressFiber, currentFiber) {
    // TODO 如果节点有挂载事件  需要更新这些事件!!!!!!!!!
    const wkProps = workInProgressFiber.props;
    if (!wkProps)
        return;
    // 如果有事件 创建对应的Effect
    const hasEvent = wkProps.hasOwnProperty('onClick' || 0);
    if (hasEvent) {
        pushEffectList('Update', workInProgressFiber);
    }
}
//! 判断是否有useEffect钩子调用
function reconcileUseEffect(workInProgressFiber, currentFiber) {
    if (workInProgressFiber.updateQueue) {
        pushEffectList('UseEffect', workInProgressFiber);
    }
}
exports.reconcileUseEffect = reconcileUseEffect;
//! 计算Props
function reconcileProps(workInProgressFiber, currentFiber) {
    pushEffectList('Update', workInProgressFiber);
}
//! 计算Text
function reconcileText(workInProgressFiber, currentFiber) {
    if (!workInProgressFiber.text || !currentFiber.text)
        return;
    if (workInProgressFiber.text !== currentFiber.text) {
        pushEffectList('Update', workInProgressFiber);
    }
}
//! 计算tag
function reconcileTag(workInProgressFiber, currentFiber) {
}
//! 添加(待优化)
function reconcilePlacement(workInProgressFiber, currentFiber) {
    const wkKey = workInProgressFiber === null || workInProgressFiber === void 0 ? void 0 : workInProgressFiber.key;
    const curKey = currentFiber === null || currentFiber === void 0 ? void 0 : currentFiber.key;
    // 或者有cur  无work算为插入节点
    if (!currentFiber && workInProgressFiber) {
        pushEffectList('Placement', workInProgressFiber);
    }
}
//! 删除
function reconcileDeletion(workInProgressFiber, currentFiber) {
    //todo wk没有节点 current有节点 删除current
    if (!workInProgressFiber && currentFiber) {
        pushEffectList('Delete', currentFiber);
        return false;
    }
    //todo 如果有key  且不一样 删除current 否则下一次会进行大量更新(需要重写)
    else if (workInProgressFiber.key || currentFiber.key) {
        if (workInProgressFiber.key !== currentFiber.key) {
            pushEffectList('Delete', currentFiber);
            return false;
        }
    }
    return true;
}
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
//! diff两个节点综合方法
//! ----------比较wk和cur两个fiber  生成不同的Effect (打上tag)-------------
function reconcileFiberNode(workInProgressFiber, currentFiber) {
    //TODO 开始先进行删除和添加的diff计算  (需要在最先进行 因为之后的就不需要进行了)
    reconcilePlacement(workInProgressFiber, currentFiber);
    let needDiff = true;
    if (workInProgressFiber && !currentFiber) {
        needDiff = false;
    }
    else if (!workInProgressFiber && currentFiber) {
        reconcileDeletion(workInProgressFiber, currentFiber);
        needDiff = false;
    }
    else if (workInProgressFiber.key !== currentFiber.key) {
    }
    if (needDiff) {
        // TODO 进行text的判断 生成Effect
        reconcileText(workInProgressFiber, currentFiber);
        //TODO 有事件更新事件
        reconcileEvent(workInProgressFiber, currentFiber);
        //TODO 判断是否使用了useEffect
        reconcileUseEffect(workInProgressFiber, currentFiber);
    }
}
exports.reconcileFiberNode = reconcileFiberNode;


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Rekv = void 0;
const useState_1 = __webpack_require__(4);
const useEffect_1 = __webpack_require__(2);
// ----------------------使用的工具函数0-------------------
const utils_1 = __webpack_require__(12);
class Rekv {
    // 构造函数
    constructor(args) {
        this.delegate = {}; // 拦截器
        this._events = {}; // 键值对  根据不同key存放对应的updater数组
        this._updateId = 0; // updater的ID 用于优化类组件
        this._state = {}; // 全局state
        this._inDelegate = false; // 拦截器相关
        //todo ---------传入state的key  使用useEffect监听_state中的[key] ---------------- 
        this.useState = (...keys) => {
            const [value, setValue] = (0, useState_1.myUseState)(this._state); //!_state对象
            //声明updater   
            const updater = () => {
                setValue(this._state);
            };
            //todo 监听keys数组  对其中每个添加/删除listener(on/off)
            (0, useEffect_1.myUseEffect)(() => {
                for (let i = 0, len = keys.length; i < len; i++) {
                    this.on(keys[i], updater);
                }
                return () => {
                    for (let i = 0, len = keys.length; i < len; i++) {
                        this.off(keys[i], updater);
                    }
                };
            }, keys);
            return this._state; //todo 直接返回当前状态
        };
        if (!(0, utils_1.isPlainObject)(args.allStates)) {
            throw new Error('init state is not a plain object');
        }
        this._state = args.allStates;
        const effects = {};
        // 如果传入了effect项  则遍历里面的函数并call  
        if (args.effects) {
            const effectKeys = Object.keys(args.effects);
            for (let i = 0, len = effectKeys.length; i < len; i++) {
                const key = effectKeys[i];
                const func = args.effects[key];
                args.effects[key] = (...args) => func.call(this, ...args); //bind
            }
        }
        // 绑定effects到实例上
        this.effects = args.effects || effects;
    }
    //todo 使用添加一个listener(callback)  cb类型为<initState[K]>
    //todo 每次执行on 都会往_event中推入一个[name]:updater项
    on(name, callback) {
        const s = this._events[name]; // _events =  {'name':undefined}
        if (!s) { // 如果event中没有[name]属性  则将callback作为数组存入_event[name]
            this._events[name] = [callback]; // _events =  {'name':[setValue(name1),setValue(name2)]}
        }
        else if (s.indexOf(callback) < 0) { // 如果有[name]属性  且其中无cb  则存入cb
            s.push(callback);
        }
    }
    // 从_event[name]中移除callback(listener)
    off(name, callback) {
        const s = this._events[name];
        this._events[name] = [callback];
        if (s) {
            const index = s.indexOf(callback);
            if (index >= 0) {
                s.splice(index, 1);
            }
        }
    }
    //! --------- 两种setState方法  传入{...states} 或者(state)=> ({...states})---------
    setState(param) {
        let kvs; // {...states}
        //todo 将state保存到kvs上
        if ((0, utils_1.isFunction)(param)) {
            kvs = param(this._state);
        }
        else {
            kvs = param;
        }
        //todo 开启beforeUpdate拦截器(无则不开启)  执行对应逻辑
        if (!this._inDelegate) {
            this._inDelegate = true;
            if (this.delegate && (0, utils_1.isFunction)(this.delegate.beforeUpdate)) {
                const ret = this.delegate.beforeUpdate({ store: this, state: kvs });
                if (ret) {
                    kvs = ret;
                }
            }
            if (Rekv.delegate && (0, utils_1.isFunction)(Rekv.delegate.beforeUpdate)) {
                const ret = Rekv.delegate.beforeUpdate({ store: this, state: kvs });
                if (ret) {
                    kvs = ret;
                }
            }
            this._inDelegate = false;
        }
        //todo 传入的states对象做类型判断
        if (!(0, utils_1.isPlainObject)(kvs)) { // {...states}
            throw new Error('setState() only receive an plain object');
        }
        const keys = Object.keys(kvs);
        const needUpdateKeys = [];
        const updatedValues = {};
        //todo 前后states对象进行遍历对比(for循环)  
        for (let i = 0, len = keys.length; i < len; i++) {
            const key = keys[i];
            if (this._state[key] !== kvs[key]) { //todo 不同的属性
                needUpdateKeys.push(key); // key推入needUpdateKeys数组 //!最小量更新
                updatedValues[key] = kvs[key]; // value推入updatedValue数组
                this._state[key] = kvs[key]; // 更新_state
            }
        }
        //todo 如果有需要更新的state（needUpdateKeys.length > 0）
        if (needUpdateKeys.length > 0) {
            this._state = Object.assign({}, this._state); // 拷贝
            this.updateComponents(...needUpdateKeys);
        }
        //todo 开启afterUpdate拦截器(无则不开启)  执行对应逻辑
        if (!this._inDelegate) {
            this._inDelegate = true;
            if (this.delegate && (0, utils_1.isFunction)(this.delegate.afterUpdate)) {
                this.delegate.afterUpdate({ store: this, state: updatedValues });
            }
            if (Rekv.delegate && (0, utils_1.isFunction)(Rekv.delegate.afterUpdate)) {
                Rekv.delegate.afterUpdate({ store: this, state: updatedValues });
            }
            this._inDelegate = false;
        }
    }
    //todo 作为对象的getter
    get currentState() {
        return this._state;
    }
    //todo------------ 直接返回_state----------------------
    getCurrentState() {
        return this._state;
    }
    //todo -------------更新组件  传入needUpdate数组的keys---------------------
    updateComponents(...keys) {
        //todo batch函数将内部所有的setValue合并到一个setValue执行(react底层方法)
        //! 暂时废弃
        for (let i = 0, keysLen = keys.length; i < keysLen; i++) {
            const key = keys[i]; //'name'
            //todo 每次执行on 都会往_event中推入一个[name]:updater项
            const updaters = this._events[key]; //取出该key的updater
            if (Array.isArray(updaters)) {
                for (let j = 0, updaterLen = updaters.length; j < updaterLen; j++) {
                    const updater = updaters[j];
                    // check whether the updater has been updated, the same updater may watch different keys
                    updater.updateId = this._updateId; //! 隐式挂一个id属性
                    updater(this._state[key]);
                }
            }
        }
        //todo----------- 每次更新id++  防止栈溢出----------------------
        this._updateId++;
        // istanbul ignore next
        if (this._updateId >= 2147483647) {
            // _updateId will be reset to zero to avoid overflow (2147483647 is 2**31-1)
            this._updateId = 0;
        }
    }
}
exports.Rekv = Rekv;
// 定义类中需要使用的数据
Rekv.delegate = {};
exports["default"] = Rekv;


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPlainObject = exports.isFunction = void 0;
function isFunction(fn) {
    return typeof fn === 'function';
}
exports.isFunction = isFunction;
// 判断是否是原始对象(未包装过的对象)
function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    // 找到原型练最里层(Object原型对象)  如果传入对象的原型对象就是Object原型对象 那么就是原始对象
    //原始对象: 未经过包装的对象(比如vue的包装后的对象)
    let proto = obj;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(obj) === proto;
}
exports.isPlainObject = isPlainObject;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lzy_React_lib_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);


//! Demo组件
function Demo() {

    const [age, setAge] = (0,_lzy_React_lib_index__WEBPACK_IMPORTED_MODULE_0__.myUseState)(18)
    const [num, setNum] = (0,_lzy_React_lib_index__WEBPACK_IMPORTED_MODULE_0__.myUseState)(1)
    const [arr, setArr] = (0,_lzy_React_lib_index__WEBPACK_IMPORTED_MODULE_0__.myUseState)([])

    const longList = new Array(5000).fill(1)

    //! 支持useEffect全系使用(return函数 同样会发生死循环)
    ;(0,_lzy_React_lib_index__WEBPACK_IMPORTED_MODULE_0__.myUseEffect)(() => {
        console.log('传入[],仅仅mount时执行');
    }, [])


    ;(0,_lzy_React_lib_index__WEBPACK_IMPORTED_MODULE_0__.myUseEffect)(() => {
        console.log('不传 任意时候执行');
    })

    ;(0,_lzy_React_lib_index__WEBPACK_IMPORTED_MODULE_0__.myUseEffect)(() => {
        console.log('监听age,age改变时执行', age);
        return () => { console.log('返回的destory函数') }
    }, [age])



    //!定义onclick方法
    function addNum() {
        setNum(num + 1) //setArr并不是异步的  而是在App执行完毕之后才会进行更新
    }
    function addAge() {
        setAge(age + 1)
    }
    function addArr() {
        setArr([...arr, 'item'])
    }


    return ({
        components: {},

        data: { addNum, addAge, addArr },

        template: `
        <div>
        <h1>Demo</h1>
        
        <div>简单适配了bootStarp组件库</div>
        <button type="button" class="btn btn-primary" onClick={addNum}>增加Num</button>
        <button type="button" class="btn btn-secondary" onClick={addAge}>增加Age和Num</button>
        <button type="button" class="btn btn-success" onClick={addArr}>增加Arr</button>

    
        <h3 className="blue">当前Num:${num}</h3>
        <h3 className='blue'>当前Age:${age}</h3>
        
        <h4 className='red'>列表渲染测试</h4>
    
        ${arr.map((item) => {
            return `<div>${item}</div>`
        })}
        
        </div>
            `
    })
}

(0,_lzy_React_lib_index__WEBPACK_IMPORTED_MODULE_0__.render)(Demo, document.getElementById('root'))






})();

/******/ })()
;