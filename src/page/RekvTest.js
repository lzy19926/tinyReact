import StoreTest from '../components/StoreTest'
import store from '../store'



function RekvTest() {

    const { age, nameData } = store.useState('age', 'nameData')
    const arr = new Array(10).fill(1)

    function changeState() {
            store.setState({ age: age + 1 })
    }


    return {
        components: { StoreTest },
        data: { changeState },
        template: `<div>
            <button onClick={changeState}>点击改变全局状态age</button>
            ${arr.map(() => {
            return `<StoreTest></StoreTest>`
        })}
        </div>`,

    }
}

export default RekvTest