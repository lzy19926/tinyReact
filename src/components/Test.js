import { myUseState, myUseEffect } from '../../lzy-React/index'




function Test() {


    const [num, setNum] = myUseState(0)

    function addNum() {
        //多个setState合并执行 一次render
        setNum(num + 1)
    }

    return {
        data: { addNum },
        template: `<button onClick={addNum}>Num:${num}</button>`,
    }
}

export default Test