#  使用说明 (需要跑在webpack环境下)
npm install

npm run dev 


##   创建组件
```tsx
function App() {
  return { 
    template: `<div>App</div>`,
  }
}

export default App

// 在index中使用render方法渲染根组件
render(App, document.getElementById('root'))
```


## 使用Hook  绑定事件 
```tsx
import { myUseState } from '../myReact/js/myHook/useState'
import { myUseEffect } from '../myReact/js/myHook/useEffect'

function App(){

  // 使用useState
  const [num,setNum] = myUseState(0)

  // myUseEffect可以通过传入不同的参数,当作生命周期钩子进行使用
  myUseEffect({}=>{
    console.log('组件mount阶段时执行')
  },[])
  myUseEffect({}=>{
    console.log('num发生变化时执行')
  },[num])
    myUseEffect({}=>{
    console.log('组件umMount阶段时执行')
  })

  //创建事件 并在data中注册
  function addNum(){
    setNum(num+1)
  }
  

  return {
    data:{  addNum  }, //需要在data里注册事件才能绑定
    template:`<div onClick={ addNum }>App</div>` // 在div中onClick绑定点击事件
  }
}

```


## 使用子组件   给子组件传递props
### 可以传递函数  实现事件冒泡和下发 (父子组件之间的事件传递)
```tsx
import Test from './components/Test'

function App(){

  const obj = {a:1,b:2}

  return {
    components:{ Test }, // 在components中注册需要使用的子组件
    data:{ obj }, // 在data里注册需要传递的props才能传递 
    template:`<Test  obj={obj} ></Test>` // 使用大写双标签 并传递props
  }
}

// 在子组件中接收props
function Test(props){ ... }
```


## 使用CSS(注意暂时仅支持原生CSS  需要注意样式名冲突) 
```tsx
import './App.css'
```

### 在html中预装了Bootstarp5的全局CSS样式 



## 使用注意
1. 只能使用双标签<tag></tag> , <App></App>  暂时不支持单标签解析
2. 传递的props和绑定事件需要在data里面注册
3. 事件暂时仅支持onClick  
4. 暂时不支持行内函数