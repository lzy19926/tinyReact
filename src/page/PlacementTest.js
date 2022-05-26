import { myUseState, myUseEffect } from '../../lzy-React/index'

//! Demo组件
function PlacementTest() {

    const [arr, setArr] = myUseState([])


    function minArr() {
        setArr(arr.splice(1))
    }

    function addArr() {
        setArr([...arr, 'item'])
    }


    return ({
        data: { minArr, addArr },
        template: `<div>
    <button onClick={addArr}>添加Arr</button> 
    <button onClick={minArr}>减少Arr</button>    
    ${arr.map((item, index) => {
            return `<div>添加项</div>`
        })}
        <div>测试节点</div>
        <div>测试节点</div>
    </div>`
    })
}



export default PlacementTest



