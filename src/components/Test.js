import { myUseState, myUseEffect } from '../../lzy-React/index'




function Test(props) {

    const [num, setNum] = myUseState(0)

    console.log(num, '渲染');
    function addNum() {
        //多个setState合并执行 一次render
        console.log(num + 1, '传入');
        setNum(num + 1)
    }

    return {
        data: { addNum },
        template: `<button onClick={addNum}>Num:${num}</button>`,
    }
}

export default Test