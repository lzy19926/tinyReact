import { myUseState, myUseEffect } from '../../lzy-React/index'

//! Demo组件
function PlacementTest() {

    const [arr, setArr] = myUseState([])


    function minArr() {
        arr.shift()
        setArr(arr)
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
            return `<div key={${index}}> item </div>`
        })}
    </div>`
    })
}



export default PlacementTest



