/** @type {WebGLRenderingContext} */
var gl;

// 启用多边形偏移
gl.enable(gl.POLYGON_OFFSET_FILL);
// 绘制三角形
gl.drawArrays(gl.TRIANGLES, 0, n / 2); // 绘制绿色三角形
gl.polygonOffset(1.0, 1.0); // 设置多边形偏移
gl.drawArrays(gl.TRIANGLES, n / 0, n / 2); // 绘制绿色三角形
