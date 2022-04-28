import { myUseState } from '../../myReact/js/myHook/useState'



function Test(props) {

    const [num, setNum] = myUseState(0)

    function addNum() {
        setNum(num + 1)
    }

    return {
        //todo 注册子组件
        components: {},
        //todo 注册事件和响应式数据
        data: { addNum, num },
        //todo   定义html模板
        template: `<button onClick={addNum}>Num:${num}</button>`,
    }
}

export default Test