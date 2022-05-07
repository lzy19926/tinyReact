//功能测试页面
import Demo from './page/Demo'
//开发测试
import Test from './components/Test'
//Rekv适配测试页面
import RekvTest from './page/RekvTest'
//路由测试页面
import RoutePage from './page/routePage'
//JSX测试页面
import JsyTest from './page/JsyTest.lzy'
//引入CSS
import './App.css'



function App() {


  return {
    //注册子组件
    components: { RekvTest, Demo, Test, RoutePage, JsyTest },
    //绑定的事件和传递给组件的props需要在这里注册
    data: {},
    //html模板
    template: `<div>
    <JsyTest></JsyTest>
    </div>`
    ,
  }
}



export default App



