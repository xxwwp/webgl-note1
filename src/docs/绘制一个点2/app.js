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
  // 将一个坐标存储到 a_Position
  gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
  // 也可以使用矢量版本
  // gl.vertexAttrib3fv(a_Position, new Float32Array([0.0, 0.0, 0.0]) );

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 绘制一个点
  gl.drawArrays(gl.POINTS, 0, 1);
}

main();
