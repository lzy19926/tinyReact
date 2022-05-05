"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenLink = void 0;
function listenLink() {
    const linksArr = document.getElementsByTagName('fc-link');
    for (let i = 0; i < linksArr.length; i++) {
        const link = linksArr[i].childNodes;
        console.log(link);
    }
}
exports.listenLink = listenLink;
