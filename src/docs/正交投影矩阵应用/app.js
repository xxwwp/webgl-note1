import { mat4 } from "../../lib/cdn.jsdelivr.net_npm_gl-matrix@3.4.3_+esm.js";

// 顶点着色器程序
const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
uniform mat4 u_Ortho; // 正交投影矩阵

void main () {
  gl_Position = u_Ortho * a_Position; // 使用矩阵与顶点相乘
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

async function main() {
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

  // left right bottom top near far
  const params = [-1, 1, -1, 1, 1, -1];

  function render() {
    const n = initVertexBuffers(gl, params);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

  window.matParam = (dirction, event) => {
    const value = parseFloat(event.target.value);
    params[dirction] = value;
    event.target.nextElementSibling.innerText = value;
    render();
  };

  render();
}

/**
 * 初始化顶点
 * @param {WebGLRenderingContext} gl
 */
function initVertexBuffers(gl, orthoParams) {
  function getLocationa(aName) {
    const location = gl.getAttribLocation(gl.program, aName);
    if (location < 0 || location === null) throw Error(`找不到 ${aName} 的存储位置`);
    return location;
  }
  function getLocationu(uName) {
    const location = gl.getUniformLocation(gl.program, uName);
    if (location < 0 || location === null) throw Error(`找不到 ${uName} 的存储位置`);
    return location;
  }

  const a_Position = getLocationa("a_Position");
  const a_Color = getLocationa("a_Color");
  const u_Ortho = getLocationu("u_Ortho");

  const vertexs = new Float32Array(
    [
      [-0.5, 0.0, 0.0, 1.0, 0.0, 0.0], // 顶点坐标 XYZ，颜色 rgb
      [0.5, 0.0, 0.0, 0.0, 1.0, 0.0],
      [0.0, 0.5, 0.0, 0.0, 1.0, 1.0],
    ].flat(2)
  );

  // 投影区域相对渲染区域，x 轴沿反方向移动 0.5 个单位，Y 轴放大两倍是一个长方体
  const mat4Ortho = mat4.ortho(mat4.create(), ...orthoParams);

  const vertexBuffer = gl.createBuffer();
  const FSIZE = vertexs.BYTES_PER_ELEMENT;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexs, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  gl.uniformMatrix4fv(u_Ortho, false, mat4Ortho);
  return 3;
}

main();
