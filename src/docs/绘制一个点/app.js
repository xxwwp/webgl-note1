// 顶点着色器程序
const VSHADER_SOURCE = `
void main () {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0); // 设置点的坐标
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

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 绘制一个点
  gl.drawArrays(gl.POINTS, 0, 1);
}

main();
