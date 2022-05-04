import { myUseState } from '../../myReact/js/myReact'



function Test(props) {

    const [num, setNum] = myUseState(0)

    function addNum() {
        setNum(num + 1)
    }

    return {
        data: { addNum },
        template: `<button onClick={addNum}>Num:${num}</button>`,
    }
}

export default Test