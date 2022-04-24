import { myUseState } from '../../myReact/js/myReact.dev';




//! 弹出模态框
function ModalContent() {

    //输入框数字
    const [number, setNumber] = myUseState(0)
    
    return (`
    <ul class="layui-form layui-form-pane" style="margin: 15px;">
    <li class="layui-form-item">
        <label class="layui-form-label">输入框</label>

        <div class="layui-input-block">
            <input class="layui-input" value=${number}>
        </div>

    </li>
    <li class="layui-form-item">
        <label class="layui-form-label">选择框</label>
        <div class="layui-input-block">
            <select name="field2">
                <option value="A">A</option>
                <option value="B">B</option>
                <select>
                </div>
            </li>
            <li class="layui-form-item" style="text-align:center;">
                <button type="submit" lay-submit lay-filter="*" class="layui-btn">提交</button>
            </li>
        </ul>
    `)
}

export default ModalContent