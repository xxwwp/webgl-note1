// 顶点着色器程序
const VSHADER_SOURCE = `
attribute vec4 a_Position;
void main () {
  gl_Position = a_Position; // 设置点的坐标为 a_Position
  gl_PointSize = 20.0; // 设置点的大小
}
`;
// 片元着色器程序
const FSHADER_SOURCE = `
void main () {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 设置颜色
}
`;

function main() {
  const canvas = document.getElementById("webgl");

  /** 初始化 webgl 上下文 @type {WebGLRenderingContext | null} */
  const gl = getWebGLContext(canvas);

  if (!gl) {
    throw new Error("webgl 初始化失败");
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("初始化着色器程序失败");
  }

  /** a_Position 的存储位置地址 */
  const a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    throw Error("找不到 a_Position 的存储位置");
  }

  // 初始化画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 创建存储区/缓冲区
  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    throw new Error("创建缓冲区失败");
  }

  // 绑定到当前缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // 设置存储区中的数据
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 0.5, 0.5, -0.5, 0.5]), gl.STATIC_DRAW);

  // 把当前缓冲区的引用或地址分配给 a_Position 的顶点缓冲区，并指定缓冲区内部的数据类型、间隔、偏移量
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // 启用 a_Position 对缓冲区的读取
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.POINTS, 0, 3);
}

main();
