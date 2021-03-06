#  使用说明 (需要跑在webpack环境下)
npm install

npm run dev 

# 脚手架初始化项目
```tsx
npm i lzy-tinyreact-cli  -g //全局安装脚手架

tinyReact -v // 查看版本号

tinyReact -create <projectName> // 对应目录下创建项目

npm install // 项目中安装依赖包
```

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
  myUseEffect(()=>{
    console.log('组件mount阶段时执行')
  },[])
  myUseEffect(()=>{
    console.log('num发生变化时执行')
  },[num])
    myUseEffect(()=>{
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
```tsx
//可以传递函数  实现事件冒泡和下发 (父子组件之间的事件传递)
import Test from './components/Test'

function App(){

  const obj = {a:1,b:2}

  return {
    components:{ Test }, // 在components中注册需要使用的子组件
    data:{ obj }, // 在data里注册需要传递的props才能传递 
    template:`<Test  obj={obj} ></Test>` // 使用大写双标签 并传递props
  }
}

// 在子组件中接收props(单向数据流  子组件修改props会发出警告 )
function Test(props){ ... }
```


## 使用map渲染列表(diff开发未完成 暂时不需要传入key)
```tsx
//注意使用map渲染时需要使用根标签包裹起来
const [arr,setArr] = useState([1,2,3])

return {
  template:
  `<div>
  ${arr.map((index,item)=>{
    return `<div>${item}</div>`
  })}
  </div>`
}
```


## 使用独立CSS(注意暂时仅支持原生CSS  需要注意样式名冲突) 
```tsx
import './App.css'
```

### 使用专用的全局状态管理器REKV (详见myRekV文件夹下的Readme)


### 在html中预装了Bootstarp5的全局CSS样式 



## 补充说明  使用注意
1. 只能使用双标签<tag></tag> , <App></App>  暂时不支持单标签解析
2. 传递的props和绑定事件需要在data里面注册
3. 事件暂时仅支持onClick  
4. 暂时不支持行内函数



## 新增功能