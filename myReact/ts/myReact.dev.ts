
//todo ------------------全局使用的结构和变量 方法-----------------------------
//! --------组件对应的fiber---------------------
let fiber: FiberNode = {
    memorizedState: null,// fiber上的所有hook链表(正在执行的hook会进入workInProgressHook)
    stateNode: () => { },    // 对应的函数组件
    updateQueue: null, // Effects的更新链表
    fiberFlags: 'mount',// fiber的生命周期 判断是否初始化
    hasRef: false,//ref相关tag
    ref: null,
    children: null,
    props: null,
    tag: null,
    text: null,
}


//! -----需要使用的全局变量---------------
const global: Global = {
    workInProgressHook: { currentHook: null },//React中使用链表来保存hooks 挂在全局
    hookIndex: 0//用于更新hook时找到对应的hook
}


//! ----------拿取需要本次update需要更新的hook----------------------
function updateWorkInProgressHook(index: number) {

    let currentHook = fiber.memorizedState

    while (currentHook && currentHook.index != index) {
        currentHook = currentHook.next
    }
    // 因为链表是按顺序的 所以这个函数每执行一次就新增一个
    global.hookIndex += 1
    return currentHook
}



//todo ----------------------Interface----------------------------------------
//!--------------单个UseEffectHook结构-------------------
//todo 通过判断tag 'useEffect','useLayoutEffect' 来判断何种钩子  改变执行时机
interface UseEffectHook {
    hookFlags: string,
    index: number,
    memorizedState: any,
    next: any
}
//!------------单个Effect(EffectUpdater)结构--------------------
interface Effect {
    tag: string,
    create: Function,
    next: Effect | null,
    destory: Function | null,
    deps: any[] | null,
}

//!-------------单个useStateHook结构-----------------
interface UseStateHook {
    hookFlags: string,
    index: number,
    memorizedState: any,
    updateStateQueue: { pending: any },//! hook.queue中保存了需要执行的update
    next: any
}
//!-------------单个StateUpdater结构--------------------
interface StateUpdater {
    action: Function | any,
    next: StateUpdater | null
}
//!------------fiberNode结构----------------------
interface FiberNode {
    memorizedState: any,
    stateNode: Function,
    updateQueue: any,
    fiberFlags: string,
    hasRef: boolean,
    ref: any,
    children: any,
    props: any,
    tag: any,
    text: any,
}
//!-------------全局需要的变量结构---------------
interface Global {
    workInProgressHook: { currentHook: any },
    hookIndex: number
}




//! render分为2部分  render阶段 - commit阶段  最后unmount

//! ----------------模拟render部分------------------------
//! 更改并生成fiber树  (结束后fiber由mount变为update)
function renderPart(functionComponent: Function) {

    fiber.stateNode = functionComponent // 挂载组件到fiber上

    const app = functionComponent() // 执行App 获取html模板

    const fiberTree = createFiberTree(app)//根据模板渲染fiberTree

    resetFiber(fiberTree) //! 挂载更新好的fiberTree到全局

    fiber.fiberFlags = 'update'//render阶段结束fiber的状态由mount为update

    return app
}

//! 赋值虚拟节点的属性给fiberNode
function resetFiber(newFiber: FiberNode) {
    const { children, props, tag, text } = newFiber

    fiber.children = children
    fiber.props = props
    fiber.tag = tag
    fiber.text = text
}


//! -----------------模拟Commit阶段-----------------------------
//! 分为三部分  beforeMutation  mutation  layout阶段
//! before 前置处理  mutation 渲染dom节点   layout  处理useEffect useLayoutEffect
function commitPart(rootDom: any) {

    //todo 这里需要遍历  不需要commit整个fiber树
    console.log('本次commit的fiber', fiber);

    //todo  mutation阶段
    const html = createHtml(fiber, rootDom)//根据fiberTree创建html



    //todo 删除当前渲染dom的子节点
    for (let i = 0; i < rootDom.childNodes.length; i++) {
        rootDom.removeChild(rootDom.children[i])
    }

    rootDom.appendChild(html)//添加渲染好的dom


    //todo  layout阶段  调用Effects链表 执行create函数()
    let destoryEffectsArr: Effect[] = []
    if (fiber.updateQueue !== null) {
        const createEffectsArr = createCallbackQueue()
        destoryEffectsArr = doCreateQueue(createEffectsArr)
    }

    //todo 处理ref
    fiber.ref = rootDom //挂载ref
    if (fiber.hasRef) {
        // commitAttachRef()//绑定ref
    }

    return destoryEffectsArr

}

//todo 遍历Effect链表 将需要执行的Effect推入数组--------------
function createCallbackQueue() {

    const createEffectsArr: Effect[] = []
    const lastEffect = fiber.updateQueue.lastEffect
    const firstEffect = lastEffect.next
    let currentEffect = firstEffect

    do {
        // Fiber=mount 时 depNochange执行depChange执行
        // Fiber=update时 depChange执行 

        //判断effectTag决定是否执行Effect(mount和dep变更时执行)
        const isFiberMount = Boolean(fiber.fiberFlags === 'mount')
        const isDepChange = Boolean(currentEffect.tag === 'depChanged')

        //将create函数推入数组  
        if (isFiberMount || isDepChange) {
            createEffectsArr.push(currentEffect)
        }
        currentEffect = currentEffect.next
    } while (currentEffect !== firstEffect)


    return createEffectsArr
}

//todo 遍历执行需要执行的Effect---生成destory---------
function doCreateQueue(createEffectsArr: Effect[]) {

    const destoryEffectsArr: Effect[] = []
    //todo 遍历Effects数组 执行create  
    //todo 生成destoryEffect数组 将destory存放到对应的Effect上
    for (let i = 0; i < createEffectsArr.length; i++) {
        const destory = createEffectsArr[i].create() // 执行create
        if (destory) {
            createEffectsArr[i].destory = destory // 赋值destory
            destoryEffectsArr.push(createEffectsArr[i])   //推入destory数组
        }
    }

    return destoryEffectsArr
}


//!  -------------根据fiberTree创建html------------------
//todo 根据tag创建节点  填充text  递归appendChild
function appendDom(fiber: any, container: any) {

    //todo 大写情况 判断为组件 不创建多余html标签
    //在这里处理props和children
    if (fiber.tag[0].toUpperCase() === fiber.tag[0]) {
        //! 直接遍历子节点 创建tag
        fiber.children.forEach((fiber: any) => {
            appendDom(fiber, container)
        });

    } else {
        //todo 如果是小写 判断为html标签  填充文本 处理属性
        const dom = document.createElement(fiber.tag)
        handleProps(fiber, dom)
        if (fiber.text) {
            dom.innerHTML = fiber.text
        }
        //todo 如果有children深度优先递归渲染dom节点 
        if (fiber.children) {
            fiber.children.forEach((fiber: any) => {
                appendDom(fiber, dom)
            });
        }
        container.appendChild(dom)
    }


}


//! 对标签中的属性进行处理 给dom节点添加标签 (未完成)
function handleProps(curFiber: any, dom: any) {
    const props = curFiber.props

    for (let key in props) {
        const value = props[key]
        switch (key) {
            //todo  处理className (合并所有的类名)
            case 'className':
                let classNameStr = ''
                for (let i = 0; i < value.length; i++) {
                    classNameStr += value[i] + ' '
                }
                dom.setAttribute("class", classNameStr.trim());
                break;

            //todo  处理class (合并所有的类名)
            case 'class':
                let classStr = ''
                for (let i = 0; i < value.length; i++) {
                    classStr += value[i] + ' '
                }
                dom.setAttribute("class", classStr.trim());
                break;

            //todo  处理点击事件
            case 'onClick':
                //! 使用{addNun} 挂载到全局方法
                const fn = window['$$' + value[0]]
                dom.addEventListener("click", fn);
                break;

            //todo  处理其他
            default:
                dom.setAttribute(key, value[0]);
                break;
        }
    }
}



//!根据fiberTree创建html
//此方法可以随时停止  传入需要改变的fiberNode实现最小量更新
const createHtml = (fiberTree: any, rootDom: any) => {
    const container = document.createDocumentFragment()
    appendDom(fiberTree, container)
    return container
}


//! ---------- unmount阶段 -------------------------
//todo  清空上一次执行完的updateQueue 重置HookIndex 执行distory函数数组
function unmountPart(destoryEffectsArr: Effect[]) {
    doDestoryQueue(destoryEffectsArr)
    fiber.updateQueue = null
    global.hookIndex = 0
}

//todo -----在unmounted时执行destorys数组
function doDestoryQueue(destoryEffectsArr: Effect[]) {
    for (let i = 0; i < destoryEffectsArr.length; i++) {
        const destory = destoryEffectsArr[i].destory
        if (destory) { destory() }
    }
}


//!--------------Render方法-------------------
function render(functionComponent: Function, rootDom: any): any {
    console.log('------------render-------------');

    const app = renderPart(functionComponent)//todo render阶段

    const destoryEffectsArr = commitPart(rootDom)//todo commit阶段

    unmountPart(destoryEffectsArr)//todo unmount阶段

    return app
}



//! -------mountEffect(useEffect第一次执行)-------------
function mountEffect(fiberFlags: string, hookFlags: string, create: Function, deps: any[] | null) {

    //todo 创建Hook 成为fiber.memorizedState上的一项Hook (单向链表)
    const hook = mountWorkInProgressHook()
    //判断是否传入deps 不同时机执行useEffect
    const nextDeps = deps === undefined ? null : deps
    //执行mountEffect 改变fiberFlages
    //! fiber.fiberFlags = fiberFlags
    //此时memorizedState保存的就是最后更新的Effect数据(第一次destory为undefined)
    hook.memorizedState = pushEffect('depNoChange', create, undefined, nextDeps)
    //todo mount后 hookFlag变为update
    hook.hookFlags = 'update'
}

//! --------创建一个Hook 形成环链表 添加到hook队列--------------
function mountWorkInProgressHook() {

    //todo 新建一个hook
    const newHook: UseEffectHook = {
        index: 0,
        memorizedState: null,
        hookFlags: 'mount',
        next: null
    }

    // 添加Hook进单向链表
    if (fiber.memorizedState !== null) {
        const lastHook = fiber.memorizedState
        newHook.index = lastHook.index + 1
        newHook.next = lastHook
        fiber.memorizedState = newHook
    }

    //接入hook到fiber上
    fiber.memorizedState = newHook
    //接入hook到workProgress
    global.workInProgressHook.currentHook = newHook

    return newHook
}

//! -------updateEffect(useEffect后续更新)-------------
function updateEffect(fiberFlags: string, hookFlags: string, create: Function, deps: any[] | null) {

    const currentHook = updateWorkInProgressHook(global.hookIndex)
    //判断是否传入deps 不同时机执行useEffect
    const nextDeps = deps === undefined ? null : deps
    //!执行updateEffect 改变fiberFlages
    //! fiber.fiberFlags = fiberFlags

    //todo  如果有currentHook 获得上一次执行create返回的的销毁函数
    if (currentHook !== null) {
        const prevEffect = currentHook.memorizedState //最后一次Effect
        //todo update时从上一次的Effect中取出销毁函数(在commit阶段执行create函数并赋值了destory)
        const destory = prevEffect.destory
        //todo 浅比较上次和本次的deps是否相等(遍历每一项deps进行比较) 
        //todo 依赖项改变和不改变  传入不同的tag  用于减少更新
        if (nextDeps !== null) {
            const prveDeps = prevEffect.deps

            if (shallowCompareDeps(nextDeps, prveDeps)) {

                pushEffect(
                    'depNoChange',
                    create,
                    destory,
                    nextDeps
                )
                return
            }
            //todo 如果deps发生改变  传入的tag为'depChanged' commit时这个Effects才会被执行
            //todo  (执行的最后一个effect要被赋值给memorizedState)
            else {
                currentHook.memorizedState = pushEffect(
                    'depChanged',
                    create,
                    destory,
                    nextDeps
                )
            }
        }
    }
}

//! ------浅比较前后deps是否发生变化-------------------
function shallowCompareDeps(nextDeps: any[], prveDeps: any[]) {

    //todo console.log('前后dep对比', prveDeps, nextDeps);

    // 选取最大的lenght
    const length = nextDeps.length > prveDeps.length ? nextDeps.length : prveDeps.length
    let res = true
    for (let i = 0; i < length; i++) {
        if (nextDeps[i] !== prveDeps[i])
            return res = false
    }
    return res
}

//! --------pushEffect创建/增加Effects更新链表---------------
function pushEffect(tag: string, create: Function, destory: any, deps: any[] | null) {
    // 创建Effect 
    const effect: Effect = {
        tag,
        create,
        destory,
        deps,
        next: null
    }

    //todo 如果Hook上没有更新链表  创建更新链表  如果有则插入一个effect到更新环链表尾部
    const updateQueue: { lastEffect: Effect | null } = { lastEffect: null }
    if (fiber.updateQueue === null) {
        updateQueue.lastEffect = effect.next = effect // 自身形成环状链表
        //更新fiber上的updateQueue环链表
        fiber.updateQueue = updateQueue
    } else {
        const lastEffect = fiber.updateQueue.lastEffect

        if (lastEffect === null) {//todo 有链表结构但是链表为空
            updateQueue.lastEffect = effect.next = effect // 自身形成环状链表

        } else { // todo 插入effect到环链表尾端
            const firstEffect = lastEffect.next
            lastEffect.next = effect
            effect.next = firstEffect
            updateQueue.lastEffect = effect //此时环链表上的最后一项就是effect
            //更新fiber上的updateQueue环链表
            fiber.updateQueue = updateQueue
        }
    }

    //todo 返回这个Effect 会被赋值给hook.memorizedState(最后一次更新的状态)
    return effect
}



//!------------useEffect主体--------------
function myUseEffect(create: Function, deps?: any[]) {
    const nextDeps = deps === undefined ? null : deps


    // 第一次useEffect执行mountEffect
    if (fiber.fiberFlags === 'mount') {
        const hookFlags = 'mount'
        mountEffect('mount', hookFlags, create, nextDeps)
        // 后续useEffect执行updateEffect
    } else if (fiber.fiberFlags === 'update') {
        const hookFlags = 'update'
        updateEffect('update', hookFlags, create, nextDeps)
    }

}


//! 错误记录
// effect中的create函数在commit阶段执行
// 而且执行时  fiberFlag需要已经变为update  
// 否则create中执行setState 会重新render   此时render的fiberFlag是mount
// 那么就会陷入死循环



//! ---------------useState返回的updater方法(updateState方法)-------------------
function dispatchAction(queue: any, newVal?: any, action?: Function) {


    //创建updater环链表
    const updater: StateUpdater = {
        action: newVal || action,
        next: null
    }
    //pending上没有updater 自己形成环状链表  ; 有updater链表  插入一个updater
    if (queue.pending === null) {
        updater.next = updater
    } else {
        updater.next = queue.pending.next
        queue.pending.next = updater
    }
    // 让此updater成为lastUpdater
    queue.pending = updater


    //! 重新render组件  这里需要调用unmount生命周期钩子
    //! 源码中使用切换fiber树的方式执行重新渲染 不需要执行生命周期(处理fiber树时变相执行了unmount阶段)
    fiber.updateQueue = null
    global.hookIndex = 0
    //todo 多个setState会触发多个render  实际上会将多个setState合并执行
    console.log('本次render的Fiber树', fiber.ref);
    //todo 需要找到当前的fiber  去进行更新
    render(fiber.stateNode, fiber.ref)
}



//! 创建一个useStateHook并添加到链表中------------------------
function createHook(initialState: any) {
    // 创建useState类型的hook
    const hook: UseStateHook = {
        hookFlags: 'mount',
        index: fiber.memorizedState ? fiber.memorizedState.index + 1 : 0,//如果fiber上没有则直接为0
        memorizedState: initialState, //记录useState中的state
        updateStateQueue: { pending: null },//! hook.queue中保存了需要执行的update
        next: null
    }
    // 将hook添加到fiber上,且将hook链接到全局hooks链表上  成为last项
    if (!fiber.memorizedState) {
        global.workInProgressHook.currentHook = hook
    } else {
        const lastEffect = fiber.memorizedState
        hook.next = lastEffect
    }

    global.workInProgressHook.currentHook = hook
    fiber.memorizedState = hook
    return hook
}

//! 更新该Hook的memorizedState-----------------------------
function updateUseStateHook(hook: UseStateHook) {


    // 取出更新链表上的最后一个state
    let baseState = hook.memorizedState
    //pending保存了链表最后一项   next就指向第一个update
    if (hook.updateStateQueue.pending) {
        let firstUpdate = hook.updateStateQueue.pending.next;
        // queue链表 执行update(执行update上的action(update传入的参数 num=>num+1))  
        do {
            const action = firstUpdate.action


            //todo 更新baseState 分为传入函数和传入newValue两种情况
            baseState = typeof action === 'function'
                ? action(baseState)
                : action
            firstUpdate = firstUpdate.next // 链表后移
            // 终止遍历链表
        } while (firstUpdate !== hook.updateStateQueue.pending.next)
        // 清空state更新链表
        hook.updateStateQueue.pending = null
    }
    // 遍历结束 将更新后的baseState存放到hook.memorizedState上
    hook.memorizedState = baseState
    return baseState
}


//! ----------执行useState会执行state的计算过程----------------
function myUseState(initialState: any) {


    //取出当前hook 如果是mount阶段就创建一个hook(初始值为initState)
    let hook;
    if (fiber.fiberFlags === 'mount') {
        hook = createHook(initialState) //创建hook 添加到hook链表
    } else {
        // 更新情况 找到对应的hook
        hook = updateWorkInProgressHook(global.hookIndex)
    }


    //todo 更新hook上保存的state
    const baseState = updateUseStateHook(hook)
    //todo 执行完useState 钩子状态变为update
    hook.hookFlags = 'update'
    //todo 返回最新的状态 和updateAction
    return [baseState, dispatchAction.bind(null, hook.updateStateQueue)]
}



//! 创建fiberNode树(Vnode树)
//! 深度优先遍历vnode树  包装成fiberNode
function creatFiberNode(vnode: any) {

    //todo 从vnode中解构出需要的值
    let { children = [], props, tag, text } = vnode

    const fiberNode = {
        memorizedState: null,// fiber上的所有hook链表(正在执行的hook会进入workInProgressHook)
        stateNode: () => { },    // 对应的函数组件
        updateQueue: null,  // Effects的更新链表
        fiberFlags: 'mount',// fiber的生命周期tag 判断是否初始化
        hasRef: false,//ref相关tag
        ref: null,
        children,
        props,
        tag,
        text,
    }



    //TODO -----------如果tag大写 解析为组件(此时无children) ----------------
    //todo 生成子vnodeTree挂载到cihldren上
    if (tag[tag.length - 1] == '/') {
        tag = tag.slice(0, tag.length - 1)
        fiberNode.tag = tag
    }

    if (tag[0] == tag[0].toUpperCase()) {
        fiberNode.stateNode = window['$$' + tag]
        const html: any = fiberNode.stateNode()
        const childVnode = tplToVDOM(html)
        children.unshift(childVnode)
    }

    //todo 如果有children 深度优先遍历  包装成fiberNode
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const vnode = children[i]
            fiberNode.children[i] = creatFiberNode(vnode)
        }
    }


    return fiberNode
}


function createFiberTree(htmlTplStr: string) {
    const vnode = tplToVDOM(htmlTplStr)

    console.log('本次创建的虚拟dom树', vnode);

    const fiberTree = creatFiberNode(vnode)

    return fiberTree
}





//! 字符串扫描解析器
class Scanner {
    text: any
    pos: any
    tail: any


    constructor(text: any) {
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
    scan(tag: any) {
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
    scanUntil(stopTag: any) {
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





//! 拆分html中的属性  (键值对)
function propsParser(propsStr: string) {

    const propsArr = propsStr.trim().split(' ')//["id='root'", "class='btn1'"]

    const props: any = {};

    //! 将拆分好的kv数组转换成键值对放入props
    propsArr.forEach(str => {

        if (str.length > 3) {//!过滤空格和换行

            //todo 解析key
            const scanner = new Scanner(str);

            let key = scanner.scanUntil('=');

            const spaceIdx = key.indexOf(' ');

            if (spaceIdx !== -1) {
                const keys = key.replace(/\s+/g, ' ').split(' ');

                const len = keys.length;
                for (let i = 0; i < len - 1; i++) {
                    props[keys[i]] = true;
                }
                key = keys[len - 1].trim();
            }

            scanner.scan("=");//! 略过=符号  从下一位开始

            //! 同时解析" 和 ' 中的value    (不能使用三元 会执行扫描)
            let val = scanner.scanUntil('"')
            if (val === '') {
                val = scanner.scanUntil("'")
            }
            //todo 普通属性value解析
            if (val[0] === "'" || val[0] === '"') {
                val = val.slice(1, val.length - 1); //去除多余的引号
            }
            //todo {{}}语法解析 获取挂载的方法 放入props
            if (val[0] === '{' && val[1] === '{') {
                val = val.slice(2, val.length - 2)
                val = window['$' + val]
            }


            props[key] = val || true;
            scanner.scan('"');

        }



    });

    return props;
}

//! 拆分html中的事件  (键值对)
function eventParser(html: string) {

    const jsEXP = /\w*\={{([\s\S]*?)}*}/
    let newHtml = html
    const event: any = {}

    //todo 没有检测到事件直接退出
    if (!jsEXP.test(html)) return { newHtml, event }

    //TODO  循环拆离里面所有的JS语法 转换成键值对  
    const kvArr = []
    let kv: any = []
    while (kv) {
        kv = jsEXP.exec(newHtml)
        if (kv) {
            kvArr.push(kv[0])
            newHtml = newHtml.replace(kv[0], '')
        }
    }
    //todo 将键值对数组拆分保存到event对象中
    kvArr.forEach((item) => {
        //删去最后两个}} 根据={{拆分成key value
        let newItem = item.slice(0, item.length - 2)
        const arr = newItem.split('={{')
        //todo 使用eval将函数字符串转化为可执行的函数
        let val = eval("(" + arr[1] + ")");
        event[arr[0]] = val
    })
    return { newHtml, event }
}

//! 拆分html中的属性222  (键值对)
function allPropsParser(html: string) {
    //todo 正则适配
    // const classEXP = /\w*\="([\s\S]*?)"/
    const classEXP = /[\w-]*="([\s\S]*?)"/  //! 包括横杠类名
    const singleEXP = /\w*\='([\s\S]*?)'/
    const eventEXP = /\w*\={([\s\S]*?)}/

    //todo 将中间多个空格合并为一个
    let newHtml2 = html.replace(/ +/g, ' ');

    const props = {}

    //todo 没有检测到事件直接退出
    const hasProps = classEXP.test(html) || singleEXP.test(html) || eventEXP.test(html)
    if (!hasProps) return { newHtml2, props }

    //TODO  循环拆离里面所有的JS语法 转换成键值对  
    const kvArr = []
    let kv = []
    while (kv) {
        kv = classEXP.exec(newHtml2) ||
            singleEXP.exec(newHtml2) ||
            eventEXP.exec(newHtml2)
        if (kv) {
            kvArr.push(kv[0])
            newHtml2 = newHtml2.replace(kv[0], '')
        }
    }

    //todo 将键值对数组拆分保存到event对象中
    kvArr.forEach((item) => {
        let kv = item.split('=')//从等号拆分
        const k = kv[0]//对key value进行处理
        const v = kv[1].slice(1, kv[1].length - 1).split(' ')
        props[k] = v//赋值给对象
    })

    return { newHtml2, props }
}


//! 将html模板字符串转换成tokens数组
function collectTokens(html: string) {

    const scanner = new Scanner(html);
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
        if (!word) continue;

        //todo 对本次扫描的字符串进行事件处理
        const { newHtml, event } = eventParser(word)//todo 拆分事件
        word = newHtml
        const { newHtml2, props } = allPropsParser(word)//todo 拆分事件
        word = newHtml2

        // 区分开始标签 # 和结束标签 /
        if (word.startsWith('/')) {
            tokens.push(['/', word.slice(1)]);
        } else {
            //todo 如果有属性存在，则解析属性 (且将event添加进去)
            const firstSpaceIdx = word.indexOf(' ');
            if (firstSpaceIdx === -1) {
                tokens.push(['#', word, { ...event, ...props },]);
            } else {
                // 解析属性
                const propsStr = word.slice(firstSpaceIdx)
                // const data = propsParser(propsStr) || {}
                tokens.push(['#', word.slice(0, firstSpaceIdx), { ...event, ...props }]);
            }
        }
    }


    return tokens;
}



//! 将tokens数组形成dom树形结构
function nestTokens(tokens: any) {
    const nestedTokens: any[] = [];
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


//! 将tokens树转化为虚拟dom树
function tokens2vdom(tokens: any) {
    const vdom: any = {};

    for (let i = 0, len = tokens.length; i < len; i++) {
        const token = tokens[i];
        vdom['tag'] = token[1];
        vdom['props'] = token[3];


        if (token[4]) {
            vdom['text'] = token[token.length - 1];
        } else {
            vdom['text'] = undefined;
        }

        const children = token[2];
        if (children.length === 0) {
            vdom['children'] = undefined;
            continue;
        };

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


//! 总和方法 转换html模板为虚拟dom
function tplToVDOM(html: string) {
    const tokensArr = collectTokens(html)
    const tokensTree = nestTokens(tokensArr)
    const vdom = tokens2vdom(tokensTree);
    return vdom;
}


export { render, myUseState, myUseEffect }

