"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = exports.myUseEffect = exports.myUseState = void 0;
const useEffect_1 = require("./myHook/useEffect");
Object.defineProperty(exports, "myUseEffect", { enumerable: true, get: function () { return useEffect_1.myUseEffect; } });
const useState_1 = require("./myHook/useState");
Object.defineProperty(exports, "myUseState", { enumerable: true, get: function () { return useState_1.myUseState; } });
const render_1 = require("./myHook/render");
Object.defineProperty(exports, "render", { enumerable: true, get: function () { return render_1.render; } });
