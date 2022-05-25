import { myUseState } from '../../lzy-React/index'

//! Demo组件
function EffectTest() {

    const arr = new Array(1000).fill('1')
    const [num, setNum] = myUseState(0)


    function addNum() {
        setNum(5)
    }

    // const timer = setTimeout(() => {
    //     setNum(3)
    //     clearTimeout(timer)
    // }, 2000)


    return ({
        data: { addNum },
        template: `<div>
    <button onClick={addNum}>AddNum</button> 
    ${arr.map(() => {
            return `<span>${num}</span>`
        })}
    </div>`
    })
}



export default EffectTest



