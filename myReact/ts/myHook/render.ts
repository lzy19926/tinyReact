//! render分为2部分  render阶段 - commit阶段  最后unmount
import { global } from './GlobalFiber'
import { updateFiberTree, createFiberTree } from '../myJsx/createFiberTree'
import { Effect, FiberNode } from './Interface'


//! ----------------模拟render部分------------------------
//! 更改并生成fiber树  (结束后fiber由mount变为update)
function renderPart(functionComponent: Function) {

    //todo 首次执行App函数
    const { template, resource, rootFiberNode } = firstRenderApp(functionComponent)

    //todo根据组件构建fiberTree(首次)
    const fiberTree = createFiberTree(template, resource)

    rootFiberNode.children.push(fiberTree)

    return rootFiberNode

}

//todo 获取上一次的fiberTree 执行所有打上tag的functionComponent进行state更新 再commit   
function updateRenderPart(functionComponent: Function, rootFiber: FiberNode) {
    // 改变tag
    global.renderTag = 'update'

    // 处理根App节点
    const { template, resource, rootFiberNode } = firstUpdateRenderApp(functionComponent, rootFiber)

    // 更新函数组件(因为处理了根节点 从根节点的第一个子节点开始递归)
    const secondNode = rootFiberNode.children[0]

    // 此时不需要创建fiberNode  所以不需要添加childFiber  直接在根fiber树上更新
    updateFiberTree(template, secondNode, resource)

    return rootFiberNode
}

//对render根Fiber节点进行处理(否则无法渲染第一个根节点)
function firstRenderApp(functionComponent: Function) {
    const rootFiberNode = global.rootFiber
    global.currentFiberNode = rootFiberNode
    rootFiberNode.stateNode = functionComponent


    //! 用于解决webpack 函数名出现bound问题
    const functionNameArr = functionComponent.name.split(' ')
    let functionName = functionNameArr[0] === 'bound'
        ? functionNameArr[1]
        : functionNameArr[0]

    rootFiberNode.tag = functionName


    const { template, data, components } = functionComponent()
    const resource = { data, components }

    rootFiberNode.fiberFlags = 'update'

    return { template, resource, rootFiberNode }
}

function firstUpdateRenderApp(functionComponent: Function, fiber: FiberNode) {


    const rootFiberNode = fiber
    global.currentFiberNode = rootFiberNode
    rootFiberNode.stateNode = functionComponent


    //! 用于解决webpack 函数名出现bound问题
    const functionNameArr = functionComponent.name.split(' ')
    let functionName = functionNameArr[0] === 'bound'
        ? functionNameArr[1]
        : functionNameArr[0]

    rootFiberNode.tag = functionName


    const { template, data, components } = functionComponent()
    const resource = { data, components }

    rootFiberNode.fiberFlags = 'update'

    return { template, resource, rootFiberNode }
}





//! -----------------模拟Commit阶段-----------------------------
//! 分为三部分  beforeMutation  mutation  layout阶段
//! before 前置处理  mutation 渲染dom节点   layout  处理useEffect useLayoutEffect
function commitPart(fiber: FiberNode, rootDom: HTMLBodyElement) {

    console.log('本次commit的fiber', fiber);

    //todo  mutation阶段
    removeHtml(rootDom)

    createHtml(fiber, rootDom)//根据fiberTree创建html

    //! 这里为了简化重新render  将root节点挂载上去了  需要更正
    fiber.ref = rootDom //挂载ref

    //todo  layout阶段  调用Effects链表 执行create函数()
    handleEffect(fiber)

    //todo 处理ref
    if (fiber.hasRef) {
        // commitAttachRef()//绑定ref
    }
}


//! 清空子节点 换nodeList为数组 再循环清空
function removeHtml(rootDom: HTMLBodyElement) {



    //转换nodeList为数组
    const childDomArr = [].slice.apply(rootDom.childNodes)

    childDomArr.forEach((dom) => {
        rootDom.removeChild(dom)
    })

}

//! (从更新的rootDom处开始)根据fiberTree创建html
function createHtml(fiber: any, rootDom: HTMLBodyElement) {

    //不同的tag标签创建不同的html标签

    let dom = document.createElement(fiber.tag)
    //todo 如果是组件节点   挂载ref 
    if (fiber.tag[0] === fiber.tag[0].toUpperCase()) {
        dom = document.createElement('fc-' + fiber.tag)
        fiber.ref = dom
        //todo 如果是小写 判断为html标签 填充文本 处理属性
    } else {
        handleProps(fiber, dom)
        if (fiber.text) { dom.innerHTML = fiber.text }
    }



    //todo 深度优先递归children 从dom开始渲染子dom节点 
    fiber.children.forEach((fiber: any) => {
        createHtml(fiber, dom)
    });

    rootDom.appendChild(dom)
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
                //! 从组件的资源池里找对应的事件
                const dataPool = curFiber.sourcePool.data
                const callback = dataPool[value[0]]
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
function handleEffect(fiber: FiberNode) {

    let destoryEffectsArr: Effect[] = []

    if (fiber.updateQueue) {
        const createEffectsArr = createCallbackQueue(fiber)
        destoryEffectsArr = doCreateQueue(createEffectsArr)
    }

    if (fiber.children.length !== 0) {
        fiber.children.forEach((fiber) => {
            handleEffect(fiber)
        })
    }

    global.destoryEffectsArr.push(...destoryEffectsArr)
}

//todo 遍历Effect链表 将需要执行的Effect推入数组--------------
function createCallbackQueue(fiber: FiberNode) {

    const createEffectsArr: Effect[] = []
    const lastEffect = fiber.updateQueue.lastEffect
    const firstEffect = lastEffect.next
    let currentEffect = firstEffect


    do {

        //判断effectTag决定是否执行Effect(mount和dep变更时执行)
        //React底层通过二进制来打tag
        const isFiberMount = Boolean(global.renderTag === 'mount')
        const isDepChange = Boolean(currentEffect.tag === 'depChanged')
        const isNullDeps = Boolean(currentEffect.tag === 'nullDeps')
        const isNoDeps = Boolean(currentEffect.tag === 'noDeps')

        //根据不同情况 将Effect推入数组  达到不同的useEffect的效果
        if (isFiberMount || isDepChange || isNullDeps) {
            createEffectsArr.push(currentEffect)
        } else if (isFiberMount && isNoDeps) {
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





//! ----------模拟unmount阶段 -------------------------
//todo  清空上一次执行完的updateQueue 重置HookIndex 执行distory函数数组
function unmountPart() {
    doDestoryQueue(global.destoryEffectsArr)
    resetFiber(global.rootFiber)
}

//todo -----在unmounted时执行destorys数组
function doDestoryQueue(destoryEffectsArr: Effect[]) {
    for (let i = 0; i < destoryEffectsArr.length; i++) {
        const destory = destoryEffectsArr[i].destory
        if (destory) { destory() }
    }
}

//todo ----遍历清空fiber树上的hookIndex 和 queue
function resetFiber(fiberTree: FiberNode) {

    fiberTree.hookIndex = 0
    fiberTree.updateQueue = null
    global.destoryEffectsArr = []
    if (fiberTree.children.length !== 0) {
        fiberTree.children.forEach((fiber) => {
            resetFiber(fiber)
        })
    }
}




//!--------------综合Render方法-------------------
function render(functionComponent: Function, rootDom: any): any {
    console.log('------------render-------------');

    const fiber = renderPart(functionComponent)//todo render阶段

    commitPart(fiber, rootDom)//todo commit阶段

    unmountPart()//todo unmount阶段

}

function updateRender(functionComponent: Function, rootDom: any, rootFiber: FiberNode): any {
    console.log('------------updateRender-------------');

    const newFiber = updateRenderPart(functionComponent, rootFiber)

    commitPart(newFiber, rootDom)//todo commit阶段

    unmountPart()//todo unmount阶段
}




export { render, updateRender, resetFiber, commitPart, unmountPart } 