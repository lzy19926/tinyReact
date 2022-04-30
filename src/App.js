//功能测试页面
import Demo from './page/Demo'
//引入CSS
import './App.css'
//Rekv适配测试
import store from './store'
//StoreTest 
import StoreTest from './components/StoreTest'



function App() {

  // const { name, age } = store.useState('name', 'age')


  function changeState() {
    store.setState({ age: 20 })
  }

  return {
    //注册子组件
    components: { Demo, StoreTest },
    //绑定的事件和传递给组件的props需要在这里注册
    data: { changeState },
    //html模板
    template: `<div>

      
      <button onClick={changeState}>点击改变全局状态age</button>
      <StoreTest></StoreTest>
      <StoreTest></StoreTest>
      <StoreTest></StoreTest>

      <h2>CSS样式演示页面</h2>
      <div className="red">支持import样式文件</div>
      
      <div>简单适配了bootStarp组件库</div>
      <button type="button" class="btn btn-primary">primary</button>

      <h2>hooks,响应式,组件化功能演示页面</h2>
      

    </div>`,
  }
}



export default App



