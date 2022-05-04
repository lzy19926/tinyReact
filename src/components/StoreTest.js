
import store from "../store";
import { myUseEffect } from '../../myReact/js/myReact'


function StoreTest(props) {

    const { age } = store.useState('age')

    //! 全局状态可作为依赖项 适配useEffect
    myUseEffect(() => {
        console.log('age全局状态发生变化');
    }, [])

    return {
        template: `<div>
            <div>value:${age}</div>
        </div>`
    }
}

export default StoreTest