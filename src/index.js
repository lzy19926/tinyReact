import { render } from '../lzy-React-dev/index'
import App from './App.lzy'

// 渲染app
console.time('first-render');
render(App, document.getElementById('root'))
console.timeEnd('first-render');















