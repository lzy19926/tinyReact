import { myUseState } from '../../myReact/js/myReact'



function Test(props) {

    const [num, setNum] = myUseState(0)
    const [age, setAge] = myUseState(18)


    function addNum() {
        //多个setState合并执行 一次render
        setNum(num + 1)
        setAge(age + 1)
    }

    return {
        data: { addNum },
        template: `<button onClick={addNum}>Num:${num} Age:${age}</button>`,
    }
}

export default Test