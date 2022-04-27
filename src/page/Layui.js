

import { myUseEffect } from '../../myReact/js/myHook/useEffect';
import { myUseState } from '../../myReact/js/myHook/useState';
//! 引入并配置Layui
import '../../public/layui'
import ModalContent from '../components/modalContent'

layui.use(function () {
    var layer = layui.layer
        , form = layui.form
        , laypage = layui.laypage
        , element = layui.element
        , laydate = layui.laydate
        , util = layui.util;



    //日期
    laydate.render({
        elem: '#test2'
        , value: undefined
        , isInitValue: true
    });

    //触发事件
    util.event('test-active', {
        'test-form': function () {
            layer.open({
                type: 1
                , resize: false
                , shadeClose: true
                , area: '350px'
                , title: 'layer + form'
                , content: ModalContent()
                , success: function (layero, index) {
                    layero.find('.layui-layer-content').css('overflow', 'visible');

                    form.render().on('submit(*)', function (data) {
                        layer.msg(JSON.stringify(data.field), { icon: 1 });
                        //layer.close(index); //关闭层
                    });
                }
            });
        }
    });
});


function tabChange(id) {
    var element = layui.element;
    console.log(element);
    element.tabChange('docDemoTabBrief', id);
}



//todo 定义函数式组件
function LayuiPage() {

    const [id, setId] = myUseState(0)

    myUseEffect(() => {
        tabChange(id)
    }, [id])
    const data = ['网站设置', '用户管理', '权限分配', '商品管理', '订单管理']
   
    function changeId() {
        setId(id + 1)
    }
    window.$$changeId = changeId

    return (`

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
            return `<div class="layui-tab-item layui-show">${item}内容id:${id}</div>`
        }
        return `<div class="layui-tab-item ">${item}内容</div>`
    })}
  </div>

</div>  

    <button class="layui-btn" onClick={changeId}>更改id</button>
    <button class="layui-btn" test-active="test-form">弹框按钮</button>
    <button class="layui-btn" id="test2">日历按钮</button>
  
</blockquote>

    `)
}
window.$$LayuiPage = LayuiPage

export default LayuiPage



