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

    //! 这里为了简化重新render  将root节点挂载上去了  需要更正
    fiber.ref = rootDom //挂载ref

    //todo  layout阶段  调用Effects链表 执行create函数()
    //遍历fiber树  找到Effect列表执行
    handleEffect(fiber)



    //todo 处理ref
    if (fiber.hasRef) {
        // commitAttachRef()//绑定ref
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
const createHtml = (fiberTree: any) => {

    const container = document.createDocumentFragment()
    appendDom(fiberTree, container)
    return container
}



//! ---------- unmount阶段 -------------------------
//todo  清空上一次执行完的updateQueue 重置HookIndex 执行distory函数数组
function unmountPart() {
    doDestoryQueue(global.destoryEffectsArr)
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
    global.destoryEffectsArr = []
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

    commitPart(rootDom)//todo commit阶段

    unmountPart()//todo unmount阶段

    return app
}



//  !-----------updateRender方法(未完成)--------------------------
function updateRender(functionComponent: Function, rootDom: any): any {

    global.renderTag = 'update'

    const html = functionComponent() // 执行App 获取html模板

    const fiberTree = updateFiberTree(html)//根据模板渲染子fiberTree

    fiber.children = fiberTree//! 将更新后的子fiberTree挂载到App

    createRootFiberTree(fiberTree, functionComponent) //!根据子FiberTree生成根fiberTree


    // //todo 获取上一次的fiberTree 执行所有打上tag的functionComponent进行state更新 再commit   

    commitPart(rootDom)//todo commit阶段

    unmountPart()//todo unmount阶段


}


export { render, updateRender, resetFiber } 