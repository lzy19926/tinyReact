##  使用说明 (需要跑在webpack环境下)

1. 创建dist文件夹 src文件夹   都创建index.html
2. 配置webpack

```tsx
// index.html
<body>
    <div id="root"></div>
    <script src='./bundle.js'></script>
</body>
```


##   创建组件
```tsx
// js 引入方法 创建函数组件  渲染到页面
import { render,myUseEffect, myUseState } from './js/myReact.dev'

function App() {
    return `<h1>App</h1>`
}

render(App, document.getElementById('root'))
```



### 绑定事件和使用子组件
```tsx
function addNum() {
     console.log('执行函数')
}

function Item() {
    return `<button onClick={addNum}>子组件</button>`
}
//需要将子组件和函数挂在全局  使用onClick={}绑定
window.$$Item = Item 
window.$$addNum = addNum

```