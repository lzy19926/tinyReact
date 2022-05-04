import { render } from 'lzy-react'
import App from './App'

// 渲染app
console.time('first-render');
render(App, document.getElementById('root'))
console.timeEnd('first-render');
















