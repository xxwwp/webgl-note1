// 顶点着色器程序
const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;

void main () {
  gl_Position = a_Position; // 设置点的坐标为 a_Position
  v_Color = a_Color;
}
`;
// 片元着色器程序
const FSHADER_SOURCE = `
precision mediump float;
varying vec4 v_Color;
void main () {
  gl_FragColor = v_Color;
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
  /** a_Position 的存储位置地址 */
  const a_Color = gl.getAttribLocation(gl.program, "a_Color");
  if (a_Color < 0) {
    throw Error("找不到 a_Color 的存储位置");
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

  const vertexBuffers = new Float32Array([
    ...[0.0, 0.0, 1.0, 0.0, 0.0], // 数据格式为 X、Y、R、G、B
    ...[0.5, 0.5, 0.0, 1.0, 0.0],
    ...[-0.5, 0.5, 0.0, 0.0, 1.0],
  ]);

  // 设置存储区中的数据
  gl.bufferData(gl.ARRAY_BUFFER, vertexBuffers, gl.STATIC_DRAW);
  const FSIZE = Float32Array.BYTES_PER_ELEMENT;

  // 填充顶点坐标
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);

  // 填充顶点颜色
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

main();
