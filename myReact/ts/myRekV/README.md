
## 创建全局store
```tsx
 const store = new Rekv({allStates:{
    name:'张三',
    age:18,
}})

// 注册并使用属性
const { name,age } = store.useState(['name','age'])

// 修改store中属性
store.setState({age:19})
```




