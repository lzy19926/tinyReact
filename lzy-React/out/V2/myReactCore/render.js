"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
const createFiberTree_1 = require("../myJSX/createFiberTree");
function render(componenet) {
    const elementTree = componenet();
    const binadyElementTree = (0, createFiberTree_1.transformElementTreeToBinadyTree)(elementTree, undefined);
    const rootFiber = undefined;
    const childFiber = (0, createFiberTree_1.createFiberTree)(binadyElementTree, rootFiber);
}
exports.render = render;
