
//! 引入并配置Layui
import '../../public/layui'
import ModalContent from './modalContent'

layui.use(function () {
    var layer = layui.layer
        , form = layui.form
        , laydate = layui.laydate
        , util = layui.util;

    //输出版本号
    lay('#version').html(layui.v);
    
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

//todo 定义函数式组件
function LayuiPage() {


    return (`

  <blockquote class="layui-elem-quote">
   
    <button class="layui-btn" test-active="test-form">弹框按钮</button>
    <button class="layui-btn" id="test2">日历按钮</button>
  
    <div class="layui-text">
        <ul>
         <li>你当前预览的是：<span>layui-v<span id="version"></span></span></li>
         <li>layui 是一套开源的 Web UI（界面）组件库。这是一个极其简洁的演示页面</li>
        </ul>
    </div>

</blockquote>

    `)
}
window.$$LayuiPage = LayuiPage

export default LayuiPage



