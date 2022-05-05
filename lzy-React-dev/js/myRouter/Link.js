"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
function Link({ to, title, component }) {
    //todo 切换路由页面简易逻辑
    function switchRoute() {
        //todo 修改页面path
        history.pushState(null, null, to);
        //todo 获取容器DOM(刚开始获取不到)
        const container = document.getElementById('routeContainer');
        //todo 创建到容器节点时  将容器节点的fiber挂载到全局  以便获取(需修改)
        const containerFiber = window.$$routeContainerFiber;
        //todo 改变fiebrFlag，以便创建新的组件节点(需要修改)
        containerFiber.fiberFlags = 'mount';
        //todo 重置当前fiber(初始化所有状态)
        containerFiber.children = [];
        containerFiber.memorizedState = null;
        //todo 重新render该组件
        (0, index_1.render)(component, container, containerFiber);
    }
    return {
        data: { switchRoute },
        template: `<a href='${to}' onClick={switchRoute}>${title}</a>`
    };
}
exports.default = Link;
