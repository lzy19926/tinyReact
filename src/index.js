import { render } from '../myReact/js/myReact'
import App from './App'

// 渲染app
console.time('first-render');
render(App, document.getElementById('root'))
console.timeEnd('first-render');
















