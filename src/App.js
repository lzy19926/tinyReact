// Test小组件
import Test from './page/Test'
import { myUseState } from '../myReact/js/myHook/useState'
import { myUseEffect } from '../myReact/js/myHook/useEffect'



//功能测试页面
import Demo from './page/Demo'
// Tab组件测试
import LayuiTab from './myUI/tab'


function App() {

  const [age, setAge] = myUseState(20)

  return {
    components: { Demo, LayuiTab, Test },

    data: {},

    template: `<Test></Test> `,
  }
}



export default App



