"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createElement = void 0;
// 判断是否为Element
function isElement(node) {
    if (!node.$$typeof)
        return false;
    return Symbol.keyFor(node.$$typeof) === 'lzyElement';
}
// 创建Element树
function createElement(...args) {
    let key;
    let ref;
    let children = [];
    const tag = args[0];
    const config = args[1];
    const childNodes = args.slice(2);
    // 单独处理ref和key
    if (config) {
        ref = config.ref;
        key = config.key;
        // 删除属性
        config === null || config === void 0 ? true : delete config.ref;
        config === null || config === void 0 ? true : delete config.key;
    }
    // 遍历处理childrenNode
    if (childNodes.length > 0) {
        childNodes.forEach((child) => {
            if (isElement(child)) {
                children.push(child);
            }
            else {
                children.push({
                    $$typeof: Symbol.for('textElement'),
                    text: child
                });
            }
        });
    }
    //返回生成的虚拟dom
    return {
        $$typeof: Symbol.for('lzyElement'),
        tag,
        ref,
        key,
        props: config,
        children
    };
}
exports.createElement = createElement;
// 测试函数
const test = () => {
    function App() {
        return /*#__PURE__*/ createElement("div", null, "123", 
        /*#__PURE__*/ createElement("div", {
            id: 1
        }, "1"), /*#__PURE__*/ createElement("div", {
            id: 1
        }, "1"));
    }
    const res = App();
    console.log(res);
};
