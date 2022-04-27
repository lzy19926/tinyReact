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
  window.$$addNum = addNum

  return `<button onClick={addNum}>NUM:${num}</button>`
}

window.$$Test = Test

function App() {
  return `<Demo></Demo>`
}

window.$$App = App




export default App



