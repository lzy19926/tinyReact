"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = exports.listenLink = void 0;
function listenLink() {
    // 监听所有的routeLink标签  获取dom节点
    const linksArr = document.getElementsByTagName('fc-routelink');
    const routeContainer = document.getElementById('routeContainer');
    console.log(routeContainer);
    for (let i = 0; i < linksArr.length; i++) {
        const linkDom = linksArr[i].childNodes[0];
        //从dom上获取url 
        const url = linkDom.getAttribute('url');
        console.log(url);
        // 给link绑定事件 点击切换history
        linkDom.addEventListener('click', function () {
            history.pushState(null, null, url);
        });
    }
}
exports.listenLink = listenLink;
function Route() {
    return {
        template: `<div id='routeContainer'></div>`
    };
}
exports.Route = Route;
