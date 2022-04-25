import { fiber, global } from './GlobalFiber'
import { createFiberTree, updateFiberTree } from '../myJsx/createFiberTree'
import { Effect, FiberNode } from './Interface'


//! render分为2部分  render阶段 - commit阶段  最后unmount

//! ----------------模拟render部分------------------------
//! 更改并生成fiber树  (结束后fiber由mount变为update)
function renderPart(functionComponent: Function) {

    const html = functionComponent() // 执行App 获取html模板


    const fiberTree = createFiberTree(html)//根据模板渲染子fiberTree

    createRootFiberTree(fiberTree, functionComponent) //!根据子FiberTree生成根fiberTree

    fiber.fiberFlags = 'update'//render阶段结束fiber的状态由mount为update

    return html
}

//! 赋值虚拟节点的属性给fiberNode
//! 注意 这里生成的fiberTree总树不包括app节点  需要调整
function createRootFiberTree(newFiber: FiberNode, functionComponent: Function) {

    fiber.stateNode = functionComponent // 挂载组件到fiber上
    fiber.children = [newFiber]
    fiber.tag = functionComponent.name

}




//! -----------------模拟Commit阶段-----------------------------
//! 分为三部分  beforeMutation  mutation  layout阶段
//! before 前置处理  mutation 渲染dom节点   layout  处理useEffect useLayoutEffect
function commitPart(rootDom: any) {


    console.log('本次commit的fiber', fiber);

    //todo  mutation阶段
    const html = createHtml(fiber)//根据fiberTree创建html

    const childDom = rootDom.children[0]
    if (childDom) { rootDom.removeChild(childDom) }//删除之前的dom
    rootDom.appendChild(html)//添加渲染好的dom


    //todo  layout阶段  调用Effects链表 执行create函数()
    //! 这里需要找到当前有updateQueue的Fiber
    


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


//! 对标签中的属性进行处理 给dom节点添加标签 (未完成)
function handleProps(curFiber: any, dom: any) {
    const props = curFiber.props

    for (let key in props) {
        const value = props[key]
        //todo  处理className
        switch (key) {
            case 'className':


                dom.setAttribute("class", value);
                break;

            case 'onClick':
                //! 使用{addNun} 挂载到全局方法
                const newValue = value.slice(1, value.length - 1)
                const fn = window['$$' + newValue]
                dom.addEventListener("click", fn);
                break;

            default:
                dom.setAttribute(key, value);
                break;
        }
    }
}



//!根据fiberTree创建html
//此方法可以随时停止  传入需要改变的fiberNode实现最小量更新
const createHtml = (fiberTree: any) => {

    const container = document.createDocumentFragment()
    appendDom(fiberTree, container)
    return container
}


//! ---------- unmount阶段 -------------------------
//todo  清空上一次执行完的updateQueue 重置HookIndex 执行distory函数数组
function unmountPart(destoryEffectsArr: Effect[]) {
    doDestoryQueue(destoryEffectsArr)
    resetFiber(fiber)
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
    if (fiberTree.children.length !== 0) {
        fiberTree.children.forEach((fiber) => {
            resetFiber(fiber)
        })
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



//  !-----------updateRender方法--------------------------
//!---------------updateFiberTree()-------------------------
// function updateFiberTree(fiberTree: FiberNode) {
//     //todo 在这里同样要将currentFiber赋值  告诉流程哪个fiber正在进行
//     global.currentFiberNode = fiberTree

//     if (typeof fiberTree.stateNode === 'function') {
//         fiberTree.stateNode()
//     }
//     if (fiberTree.children.length !== 0) {
//         fiberTree.children.forEach((fiber) => {
//             updateFiberTree(fiber)
//         })
//     }
// }




function updateRender(functionComponent: Function, rootDom: any): any {

    global.renderTag = 'update'

    const html = functionComponent() // 执行App 获取html模板

    const fiberTree = updateFiberTree(html)//根据模板渲染子fiberTree

    fiber.children = fiberTree//! 将更新后的子fiberTree挂载到App

    createRootFiberTree(fiberTree, functionComponent) //!根据子FiberTree生成根fiberTree

    fiber.fiberFlags = 'update'//render阶段结束fiber的状态由mount为update

    // //todo 获取上一次的fiberTree 执行所有打上tag的functionComponent进行state更新 再commit   



    const destoryEffectsArr = commitPart(rootDom)//todo commit阶段

    unmountPart(destoryEffectsArr)//todo unmount阶段


}


export { render, updateRender, resetFiber } 