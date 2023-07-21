// 绘制一个点
gl.drawArrays(gl.POINTS, 0, 1);

const now = Date.now();
// 阻塞 1 秒渲染
while (now + 1000 > Date.now());

gl.vertexAttrib3f(a_PointPosition, x / 2, y / 2, 0.0);
gl.drawArrays(gl.POINTS, 0, 1);
// 总是和前一个点一起渲染
