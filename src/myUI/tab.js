

import { myUseEffect } from '../../myReact/js/myHook/useEffect';
import { myUseState } from '../../myReact/js/myHook/useState';





function tabChange(id) {
    var element = layui.element;
    element.tabChange('docDemoTabBrief', id);
}


//todo 定义函数式组件
function LayuiTab() {

    const [tabId, setTabId] = myUseState(0)
    const data = ['网站设置', '用户管理', '权限分配', '商品管理', '订单管理']

    myUseEffect(() => {
        tabChange(tabId)
    }, [tabId])

    function changeTabId(id) {
        tabChange(3)
    }

    return {

        data: { changeTabId },

        template: `
        <blockquote class="layui-elem-quote">
          <div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief">
              
              <ul class="layui-tab-title">
                ${data.map((item, index) => {
            return `<li lay-id="${index}">${item}</li>`
        })}
              </ul>
      
              <div class="layui-tab-content" lay-filter="mytab">
                  ${data.map((item, index) => {
            if (index === 0) {
                return `<div class="layui-tab-item layui-show">${item}内容id:${tabId}</div>`
            }
            return `<div class="layui-tab-item ">${item}内容</div>`
        })}
              </div>
      
           <button onClick={changeTabId}>改变tab</button>
          </div>  
        </blockquote>
      
          `
    }
}


export default LayuiTab



