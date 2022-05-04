//功能测试页面
import Demo from './page/Demo'
//开发测试
import Test from './components/Test'
//引入CSS
import './App.css'
//Rekv适配测试
import RekvTest from './page/RekvTest'




function App() {

  let arr = new Array(10).fill('item')

  return {
    //注册子组件
    components: { RekvTest, Demo, Test },
    //绑定的事件和传递给组件的props需要在这里注册
    data: {},
    //html模板
    template:
      `<div>
      <RekvTest></RekvTest>
      <Demo></Demo>
    </div>`,
  }
}



export default App



