
import { createFiberTree, transformElementTreeToBinadyTree } from '../myJSX/createFiberTree2'


export function render(componenet: any) {
    const elementTree = componenet()
    const binadyElementTree = transformElementTreeToBinadyTree(elementTree, undefined)
    const rootFiber = undefined
    const childFiber = createFiberTree(binadyElementTree, rootFiber)
}