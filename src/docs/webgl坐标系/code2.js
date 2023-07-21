// 开启深度绘制
gl.enable(gl.DEPTH_TEST);

// ... code

// 清除深度绘制缓冲区，每次绘制前调用，你也不想上次绘制时的深度数据缓冲区被应用到这一次绘制吧
gl.clear(gl.DEPTH_BUFFER_BIT);
