/** @type {HTMLCanvasElement} */
const el = document.getElementById("canvas");
const gl = el.getContext("webgl2");

if (gl === null) throw Error("webgl 上下文获取失败");

gl.clearColor(0.0, 0.0, 0.0, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);
