import { myUseEffect } from '../../myReact/js/myHook/useEffect'
import { myUseState } from '../../myReact/js/myHook/useState'


//! 使用说明: 支持onclick事件绑定  渲染子组件  className设置  map渲染列表
//! 定义的组件和方法需要使用$$挂载到全局


//!定义子组件
function Item() {
    return {
        template: `<button>子组件</button>`
    }
}


//! Demo组件
function Demo() {

    const [age, setAge] = myUseState(18)
    const [num, setNum] = myUseState(0)
    const [arr, setArr] = myUseState([])


    //! 支持useEffect全系使用(return函数 同样会发生死循环)
    myUseEffect(() => {
        console.log('传入[],仅仅mount时执行');
    }, [])

    myUseEffect(() => {
        console.log('不传 任意时候执行');
    })

    myUseEffect(() => {
        setNum(num + 1)
        console.log('监听age,age改变时执行');
    }, [age])



    //!定义onclick方法
    function addNum() {
        setNum(num + 1) //setArr并不是异步的  而是在App执行完毕之后才会进行更新
    }
    function addAge() {
        setAge(age + 1)
    }
    function addArr() {
        setArr([...arr, 'item'])
    }


    return ({
        components: { Item },

        data: { addNum, addAge, addArr },

        template: `
        <div>
    
        <h1>Demo</h1>
        
        <button onClick={addNum}>增加Num</button>
        <button onClick={addAge}>增加Age和Num</button>
        <button onClick={addArr}>增加Arr</button>
    
        <h3 className="red">当前Num:${num}</h3>
        <h3 className='red'>当前Age:${age}</h3>
        <Item></Item>
        
        <h4 className='red'>列表渲染测试</h4>
    
        ${arr.map((item) => {
            return `<div>${item}</div>`
        })}
        
        </div>
            `
    })
}


export default Demo



