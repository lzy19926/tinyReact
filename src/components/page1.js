import { myUseEffect, myUseState } from '../../myReact/js/myReact.dev'


//! 使用说明: 支持onclick事件绑定  渲染子组件  className设置  map渲染列表
//! 定义的组件和方法需要使用$$挂载到全局

//!定义子组件
function Item() {
    return `<button>子组件</button>`
}
window.$$Item = Item


function Page1() {
    const [age, setAge] = myUseState(18)
    const [num, setNum] = myUseState(0)
    const [arr, setArr] = myUseState([])


    //! 支持useEffect全系使用(return函数 同样会发生死循环)
    myUseEffect(() => {
        console.log('执行useEffect, age发生改变 num++');
        setNum(num + 1)
        return () => {
            console.log('执行destory函数 num++');
        }
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
    window.$$addNum = addNum
    window.$$addAge = addAge
    window.$$addArr = addArr


    return (`
    <div>

    <h1>Demo</h1>
    
    <button onClick={addNum}>增加Num</button>
    <button onClick={addAge}>增加Age和Num</button>
    <button onClick={addArr}>增加Arr</button>

    <h3 className="red">当前Num:${num}</h3>
    <h3 className='red'>当前Age:${age}</h3>
    <Item/>
    
    <h4 className='red'>列表渲染测试</h4>

    ${arr.map((item) => {
        return `<div>${item}</div>`
    })}
    
    </div>
        `)
}
window.$$Page1 = Page1

export default Page1



