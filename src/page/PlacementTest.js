import { myUseState, myUseEffect } from '../../lzy-React/index'
import Test from '../components/Test'

//! Demo组件
function PlacementTest() {

    const [arr, setArr] = myUseState([])

    function addArr() {
        console.log('添加');
        setArr([...arr, 'item'])
    }


    return ({
        components: { Test },
        data: { addArr },
        template: `
        <div>
        <button onClick={addArr}>增加Arr</button>

        ${arr.map((item) => {
            return `<Test></Test>`
        })}
        </div>
            `
    })
}



export default PlacementTest



