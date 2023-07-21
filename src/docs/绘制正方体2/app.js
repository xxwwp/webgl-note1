import { mat4, vec3 } from "../../lib/cdn.jsdelivr.net_npm_gl-matrix@3.4.3_+esm.js";
import { bindPerspectiveEvent, getLocaltiona, getLocaltionu, viewFront } from "../../lib/me.js";
import { Cube } from "../../lib/Cube.js";

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_Matrix;
varying vec4 v_Color;

void main () {
  gl_Position = u_Matrix * a_Position;
  v_Color = a_Color;
}
`;
const FSHADER_SOURCE = `
precision mediump float;
varying vec4 v_Color;

void main () {
  gl_FragColor = v_Color;
}
`;

function main() {
  const canvas = document.getElementById("webgl");

  /** @type {WebGLRenderingContext | null} */
  const gl = getWebGLContext(canvas);

  if (!gl) {
    throw Error("webgl 初始化失败");
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw Error("初始化着色器程序失败");
  }

  var vertexs = Cube.vertexs;

  var colors = new Float32Array(Cube.colors.colorful);

  var elements = new Uint8Array(Cube.indices);

  const n = elements.length;

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  const initAngle = {
    y: Math.PI * (45 / 180),
    x: Math.PI * (-25 / 180),
  };

  // 视图变换的参数
  const viewParam = {
    eye: new Float32Array([2, 1.5, 2]),
    front: viewFront(initAngle.y, initAngle.x),
    up: new Float32Array([0, 1, 0]),
  };

  // 透视投影的参数
  const perspectiveParam = {
    fov: Math.PI / 2,
    aspect: 1,
    near: 0.1,
    far: 20,
  };

  function render() {
    // 生成透视投影矩阵
    const { fov, aspect, near, far } = perspectiveParam;
    const mat4Perspective = mat4.perspective(mat4.create(), fov, aspect, near, far);

    // 生成视图变换矩阵
    const { eye, front, up } = viewParam;
    const mat4LookAt = mat4.lookAt(mat4.create(), eye, vec3.add(vec3.create(), eye, front), up);

    const mat = mat4.multiply(mat4.create(), mat4Perspective, mat4LookAt);

    initVertexBuffers(gl, vertexs, colors, mat);
    initElementBuffer(gl, elements);

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    // 按照 gl.TRIANGLES 模式依次绘制元素，一共 n 个元素，
    // 元素缓冲区每个元素存储格式是 gl.UNSIGNED_BYTE，取元素是偏移量从 0 开始
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }

  render();
  bindPerspectiveEvent({ view: viewParam, canvas, yScale: initAngle.y, xScale: initAngle.x }, render);
}

/**
 * 初始化顶点缓冲区
 *
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array } vertexs 顶点
 * @param {Float32Array } colors 顶点颜色
 * @param {Float32Array} perspective
 */
function initVertexBuffers(gl, vertexs, colors, perspective) {
  const a_Position = getLocaltiona(gl, "a_Position");
  const a_Color = getLocaltiona(gl, "a_Color");
  const u_Matrix = getLocaltionu(gl, "u_Matrix");

  const FSIZE = vertexs.BYTES_PER_ELEMENT;

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, vertexs, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_Color);

  gl.uniformMatrix4fv(u_Matrix, false, perspective);
}

/**
 * 初识化元素
 *
 * @param {WebGLRenderingContext} gl
 * @param {Uint8Array} elements 元素索引数据
 */
function initElementBuffer(gl, elements) {
  const elementBuffer = gl.createBuffer(); // 创建

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer); // 绑定
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elements, gl.STATIC_DRAW); // 写入
}

main();
