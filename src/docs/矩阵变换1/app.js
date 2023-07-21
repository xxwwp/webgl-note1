// 顶点着色器程序
const VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform mat4 u_Transform;

void main () {
  gl_Position = u_Transform * a_Position; // 使用矩阵变换顶点
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

  const u_Transform = gl.getUniformLocation(gl.program, "u_Transform");
  if (u_Transform < 0) {
    throw Error("找不到 u_Transform 的存储位置");
  }

  // 旋转角度 30 度
  const theta = (30 / 360) * 2 * Math.PI;
  const cosA = Math.cos(theta);
  const sinA = Math.sin(theta);

  // 平移偏移量
  const offset = 0.2;

  // 绕 Z 轴旋转矩阵 + 平移矩阵
  const matrix = new Float32Array([
    ...[cosA, sinA, 0, 0], //
    ...[-sinA, cosA, 0, 0],
    ...[0, 0, 1, 0],
    ...[offset, offset, 0, 1],
  ]);

  gl.uniformMatrix4fv(u_Transform, false, matrix);

  // 初始化画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  renderTriangles(gl, a_Position);
}

function renderTriangles(gl, a_Position) {
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

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

main();
