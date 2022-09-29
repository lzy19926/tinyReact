"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
const createFiberTree2_1 = require("../myJSX/createFiberTree2");
function render(componenet) {
    const elementTree = componenet();
    const binadyElementTree = (0, createFiberTree2_1.transformElementTreeToBinadyTree)(elementTree, undefined);
    const rootFiber = undefined;
    const childFiber = (0, createFiberTree2_1.createFiberTree)(binadyElementTree, rootFiber);
}
exports.render = render;
