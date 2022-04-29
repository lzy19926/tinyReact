#  使用说明 (需要跑在webpack环境下)
npm install

npm run dev 


##   创建组件
```tsx

function App() {
  
  return {
    //注册子组件 
    components: { },  
    //注册使用的state数据,事件,下发的props
    data: { }, 
    //html模板 (可以给标签设置属性  绑定事件 给子组件传递props)
    template: `<div>App</div>`,
  }
}

render(App, document.getElementById('root'))
```
## 使用Hook
```tsx
import { myUseState } from '../myReact/js/myHook/useState'
import { myUseEffect } from '../myReact/js/myHook/useEffect'

```





## 使用注意
1. 只能使用双标签<tag></tag>  暂时不支持单标签解析
2. 传递的props和绑定事件需要在data里面注册
3. 事件暂时仅支持onClick  
4. 使用CSS需要全局引入(功能不完善)
5. 暂时不支持行内函数