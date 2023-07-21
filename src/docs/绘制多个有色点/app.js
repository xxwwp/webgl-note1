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
precision mediump float;
uniform vec4 u_FragColor;
void main () {
  gl_FragColor = u_FragColor; // 设置颜色
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

  const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (u_FragColor < 0) {
    throw Error("找不到 u_FragColor 的存储位置");
  }

  // 初始化画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 绑定点击事件
  canvas.addEventListener("click", (e) => clickDraw(e, gl, a_Position, u_FragColor));
}

// 点数组
const points = [];
/**
 * 绘制一个点
 *
 * @param {PointerEvent} e 鼠标点击事件对象
 * @param {WebGLRenderingContext} gl
 * @param {number} a_PointPosition glsl 绘制点地址
 * @param {number} u_PointFragColor glsl 绘制点颜色地址
 */
function clickDraw(e, gl, a_PointPosition, u_PointFragColor) {
  /** 被点击的 canvas 元素 @type {HTMLCanvasElement}  */
  const el = e.currentTarget;
  /** 元素的相关位置和大小 */
  const rect = el.getBoundingClientRect();

  // 计算 x，y 点位置，需要把相关坐标转化为 -1 到 1 的形式。
  // e.clientX/Y 是鼠标相对视口左上角的位置
  // rect.left/top 是 canvas 元素的边相对视口左上角的位置
  const x = ((e.clientX - rect.left) * 2) / rect.width - 1;
  const y = -(((e.clientY - rect.top) * 2) / rect.height - 1);

  // 存储每次绘制的点的相关信息
  points.push({
    a_Position: a_PointPosition, // 点坐标地址
    u_FragColor: u_PointFragColor, // 点颜色地址
    value: new Float32Array([x, y]), // 点坐标
    color: new Float32Array([(x + 1) / 2, (y + 1) / 2, 0.0, 1.0]), // 点颜色
  });

  gl.clear(gl.COLOR_BUFFER_BIT);

  // 遍历点逐个渲染
  points.forEach((item) => {
    gl.vertexAttrib2fv(item.a_Position, item.value);
    // 设置点的颜色
    gl.uniform4fv(item.u_FragColor, item.color);

    // 绘制一个点
    gl.drawArrays(gl.POINTS, 0, 1);
  });
}

main();
