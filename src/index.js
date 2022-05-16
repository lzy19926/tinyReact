import { render } from '../lzy-React/index'
import App from './App.lzy'



//渲染树状dom树
console.time('first-render');
render(App, document.getElementById('root'))
console.timeEnd('first-render');















