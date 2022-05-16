import { myUseState, myUseEffect } from '../../lzy-React/index'




function Test(props) {
    console.log('Demo传来的props', props.num);

    const [num, setNum] = myUseState(0)

    function addNum() {
        //多个setState合并执行 一次render
        setNum(num + 1)
    }

    return {
        data: { addNum },
        template: `<button onClick={addNum}>Num:${props.num}</button>`,
    }
}

export default Test