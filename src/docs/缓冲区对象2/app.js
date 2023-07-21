// 顶点着色器程序
const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute float u_PointSize;
void main () {
  gl_Position = a_Position; 
  gl_PointSize = u_PointSize; 
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

  /** u_PointSize 的存储位置地址 */
  const u_PointSize = gl.getAttribLocation(gl.program, "u_PointSize");
  if (a_Position < 0) {
    throw Error("找不到 u_PointSize 的存储位置");
  }

  // 创建存储区/缓冲区
  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    throw new Error("创建缓冲区失败");
  }

  // 初始化画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 绑定到当前缓冲区
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // 顶点数据
  const vertexBuffers = new Float32Array([
    ...[0.0, 0.0, 5.0], // 每组数据格式为 X 坐标、Y 坐标、绘制点的大小
    ...[0.5, 0.5, 10.0],
    ...[-0.5, 0.5, 20.0],
  ]);

  const FSIZE = Float32Array.BYTES_PER_ELEMENT;

  // 设置存储区中的数据
  gl.bufferData(gl.ARRAY_BUFFER, vertexBuffers, gl.STATIC_DRAW);

  // 把当前缓冲区的引用或地址分配给 a_Position 的顶点缓冲区，并开启缓冲区读取
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_Position);

  // 把当前缓冲区的引用或地址分配给 u_PointSize 的顶点缓冲区，并开启缓冲区读取
  gl.vertexAttribPointer(u_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2);
  gl.enableVertexAttribArray(u_PointSize);

  gl.drawArrays(gl.POINTS, 0, 3);
}

main();
