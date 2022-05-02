
import store from "../store";
import { myUseEffect } from "../../myReact/js/myHook/useEffect";


function StoreTest(props) {
    
    props.id = 3 //修改id时会发出警告



    const { age } = store.useState('age')

    
    




    //! 全局状态可作为依赖项 适配useEffect
    myUseEffect(() => {
        console.log('age全局状态发生变化');
    }, [])

    return {
        template: `<div>
            <h3>Store测试组件</h3>
            <div>value:${age}</div>
        </div>`
    }
}

export default StoreTest