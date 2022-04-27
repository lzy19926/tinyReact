//功能测试页面
import Demo from './page/Demo'
//layui组件库测试页面
import LayuiPage from './page/Layui'
// Tab组件测试
import Tab from './myUI/tab'


import { myUseState } from '../myReact/js/myHook/useState'




function Test(props) {
  //! 可传入props 
  const [num, setNum] = myUseState(0)
  function addNum() {
    setNum(num + 1)
  }

  //! 执行函数  返回模板和方法  向下传递  (检测模板中需要使用的属性和方法再返回)
  //! 在构建fiber树的时候  将这些需要的资源传递给下级fiber节点
  return {
    template: `<button onClick={addNum}>NUM:${num}</button>`,
    props: {
      addNum
    }
  }
}
window.$$Test = Test




function App() {
  return {
    template: `<div>
    <Test></Test>
    <Test></Test>
    </div>`,
  }
}

window.$$App = App




export default App



