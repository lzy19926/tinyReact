
import store from "../store";

function StoreTest() {
    const { age } = store.useState('age')

    return {
        template: `<div>
            <h3>Store测试组件</h3>
            <div>value:${age}</div>
        </div>`
    }
}

export default StoreTest