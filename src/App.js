//功能测试页面
import Demo from './page/Demo'
//layui组件库测试页面
import LayuiPage from './page/Layui'
// Tab组件测试
import LayuiTab from './myUI/tab'
// Test小组件
import Test from './page/Test'


import { myUseState } from '../myReact/js/myHook/useState'
import { myUseEffect } from '../myReact/js/myHook/useEffect'



function App() {
  return {
    components: { Demo, LayuiPage, LayuiTab, Test },
    data: {},
    template: `<Test  id={1}></Test>`,
  }
}



export default App



