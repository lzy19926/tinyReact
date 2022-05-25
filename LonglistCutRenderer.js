import React from 'react';

let i = []; // 全局变量解决闭包陷阱
export function LonglistCutRenderer(props) {
  
  const { children, speed = 1 } = props;
  // console.log(children);
  
  if (speed <= 0) {
    throw Error('speed必须为正整数');
  }

  const [renderList, setRenderList] = React.useState([]);
  const [index, setIndex] = React.useState(0);

  // 监视renderList  当前index小于列表长度  执行渲染
  // 监视children 实现点击渲染
  React.useEffect(() => {
    if (index < children.length && renderList.length < children.length) {
      addListPart();
    }
  }, [renderList,children]);


  //TODO 使用requestAnimationFrame(requestIdleCallback新)配合useEffect进行切片
  const addListPart = () => {
    requestAnimationFrame(() => {
      const listPart = children.slice(index, index + speed);
      // 使用外部变量解决闭包陷阱(每次推入一个列表片段)
      i = [...i, ...listPart];
      setIndex(index + speed)
      setRenderList(i);
    });
  };

  //todo HTML解构渲染
  const renderer = () => {
    if (!Array.isArray(children)) return children
    else return renderList.map((item, index) => children[index])
  }



  //todo 通过children获取的list数组 每一个都是一个fiber节点  可以直接在jsx里渲染
  return (
    <React.Fragment>
      {renderer()}
    </React.Fragment>
  );
}
