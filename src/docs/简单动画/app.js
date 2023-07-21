// 参见 gl-matrix
import { mat4 } from "../../lib/cdn.jsdelivr.net_npm_gl-matrix@3.4.3_+esm.js";

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

  // 设置 GLSL 中的矩阵
  function setMatrix(matrix) {
    gl.uniformMatrix4fv(u_Transform, false, matrix);
  }

  // 渲染一帧的函数，内部只是渲染了一个简单的三角形
  function renderFrame() {
    renderTriangles(gl, a_Position);
  }

  // 绘制函数
  draw(setMatrix, renderFrame);
}

/** 每秒旋转的角度 45度 */
const AnglePerSecond = Math.PI / 4;
/** 程序开始的时间 */
const timeStart = Date.now();

function draw(setMatrix, renderNextFrame) {
  // 旋转的弧度
  const angle = ((Date.now() - timeStart) / 1000) * AnglePerSecond;

  // 创建平移矩阵：X 轴移动 0.5 单位
  const translate = mat4.translate(mat4.create(), mat4.create(), new Float32Array([0.5, 0.0, 0.0]));
  // 创建旋转矩阵：绕 Z 轴旋转
  const rotate = mat4.rotateZ(mat4.create(), mat4.create(), angle);
  // 计算矩阵相乘，按照矩阵相乘概念，这是先平移，再旋转
  const matrix = mat4.multiply(mat4.create(), rotate, translate);

  setMatrix(matrix);
  renderNextFrame();

  // 注册下一帧程序的预处理程序
  requestAnimationFrame(() => draw(setMatrix, renderNextFrame));
}

function renderTriangles(gl, a_Position) {
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

  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

main();
