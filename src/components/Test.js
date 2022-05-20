import { myUseState, myUseEffect } from '../../lzy-React/index'




function Test() {

    const [num, setNum] = myUseState(0)

    function addNum() {
        setNum(num + 1)
    }

    return {
        data: { addNum },
        template: `
        <div>
        <button onClick={addNum} id='btn'>Num:${num}</button>
        <div>测试:${num}</div>
        </div>
        `,
    }
}

export default Test