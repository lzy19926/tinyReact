import { render } from '../lzy-React/index'
import App from './App.lzy'
import { linkRender } from '../lzy-React/js/myHook/linkRender'
// 渲染app


// 渲染链式dom树
// console.time('first-link-render');
// linkRender(App, document.getElementById('root'))
// console.timeEnd('first-link-render');

//渲染树状dom树
console.time('first-render');
render(App, document.getElementById('root'))
console.timeEnd('first-render');















