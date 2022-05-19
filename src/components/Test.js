import { myUseState, myUseEffect } from '../../lzy-React/index'




function Test() {

    const [num, setNum] = myUseState(0)

    function addNum() {
        setNum(num + 1)
        const ref = document.getElementById('btn')
        
    }

    return {
        data: { addNum, num },
        template: `<button onClick={addNum} id='btn'>Num:${num}</button>`,
    }
}

export default Test