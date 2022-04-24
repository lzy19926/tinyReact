##  使用说明 (需要跑在webpack环境下)
npm install


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


## 使用注意
1. 只能使用双标签<tag></tag>  暂时不支持单标签解析
2. 需要将子组件和函数挂在全局