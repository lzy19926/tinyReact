//功能测试页面
import Demo from './page/Demo'
//layui组件库测试页面
import LayuiPage from './page/Layui'

import { myUseState } from '../myReact/js/myHook/useState'


function Test() {
  const [num, setNum] = myUseState(0)
  function addNum() {
    setNum(num + 1)
  }
  window.$$addNum = addNum

  return `<button onClick={addNum}>NUM:${num}</button>`
}

window.$$Test = Test


function App() {
  return (`
  <div>
  <LayuiPage></LayuiPage>
  <Demo></Demo>
  </div>
    `)
}



export default App



