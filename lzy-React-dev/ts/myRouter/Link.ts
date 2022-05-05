import { render } from '../../index'
import { myUseEffect } from '../../index'


function Link({ to, title, component }) {

    myUseEffect(() => {
        if (to === '/') {
            console.log('执行');
            switchRoute()
        }

    })



    //todo 切换路由页面简易逻辑
    function switchRoute() {
        //todo 修改页面path
        history.pushState(null, null, to)
        //todo 获取容器DOM(刚开始获取不到)
        const container = document.getElementById('routeContainer')
        //todo 创建到容器节点时  将容器节点的fiber挂载到全局  以便获取(需修改)
        const containerFiber = window.$$routeContainerFiber
        //todo 改变fiebrFlag，以便创建新的组件节点(需要修改)
        containerFiber.fiberFlags = 'mount'

        //todo 重置当前fiber(初始化所有状态)
        containerFiber.children = []
        containerFiber.memorizedState = null
        //todo 重新render该组件
        render(component, container, containerFiber)

    }

    return {
        data: { switchRoute },
        template: `<a href='${to}' onClick={switchRoute}>${title}</a>`
    }
}


export default Link