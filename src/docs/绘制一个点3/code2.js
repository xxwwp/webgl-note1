// 绘制一个点
gl.drawArrays(gl.POINTS, 0, 1);

// 事件队列异步渲染
setTimeout(() => {
  gl.vertexAttrib3f(a_PointPosition, x / 2, y / 2, 0.0);
  gl.drawArrays(gl.POINTS, 0, 1);
  // 渲染这个点不确定，有时会和前一个点一起渲染，有时单独渲染
}, 0);
