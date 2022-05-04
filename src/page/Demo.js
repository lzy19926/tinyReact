import { myUseState, myUseEffect } from 'lzy-react'
import './Demo.css'


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
        components: {},

        data: { addNum, addAge, addArr },

        template: `
        <div>
    
        <h1>Demo</h1>
        
        <div>简单适配了bootStarp组件库</div>
        <button type="button" class="btn btn-primary" onClick={addNum}>增加Num</button>
        <button type="button" class="btn btn-secondary" onClick={addAge}>增加Age和Num</button>
        <button type="button" class="btn btn-success" onClick={addArr}>增加Arr</button>

    
        <h3 className="blue">当前Num:${num}</h3>
        <h3 className='blue'>当前Age:${age}</h3>
        
        <h4 className='red'>列表渲染测试</h4>
    
        ${arr.map((item) => {
            return `<div>${item}</div>`
        })}
        
        </div>
            `
    })
}


'1434 0.9版本'


export default Demo



