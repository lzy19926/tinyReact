//功能测试页面
import Demo from './page/Demo'
//引入CSS
import './App.css'
//Rekv适配测试
import store from './store'
//StoreTest 
import StoreTest from './components/StoreTest'



function App() {

  const { age, nameData } = store.useState('age', 'nameData')


  function changeState() {
    store.setState({ age: age + 1, nameData: [...nameData, '王五'] })
  }

  const arr = [1, 2, 3]

  return {
    //注册子组件
    components: { Demo, StoreTest },
    //绑定的事件和传递给组件的props需要在这里注册
    data: { changeState, arr },
    //html模板
    template: `<div>

      <h2>------全局状态管理器演示页面------</h2>
      <button onClick={changeState}>点击改变全局状态age</button>
      <StoreTest></StoreTest>
      <StoreTest></StoreTest>
      <StoreTest></StoreTest>
      
      
    

      <h2>-----CSS样式演示页面------</h2>
      <div className="red">支持import样式文件</div>
      
      <div>简单适配了bootStarp组件库</div>
      <button type="button" class="btn btn-primary">primary</button>
      <button type="button" class="btn btn-secondary">Secondary</button>
      <button type="button" class="btn btn-success">Success</button>

      <h2>-----hooks,响应式,组件化功能演示页面------</h2>
      <StoreTest id={1}></StoreTest>

    </div>`,
  }
}



export default App



