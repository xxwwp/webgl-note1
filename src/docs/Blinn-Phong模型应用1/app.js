import { mat4, vec3 } from "../../lib/cdn.jsdelivr.net_npm_gl-matrix@3.4.3_+esm.js";
import { bindPerspectiveEvent, getLocaltiona, getLocaltionu, viewFront, glSet32ArrayBuffer } from "../../lib/me.js";
import { Cube } from "../../lib/Cube.js";

const VSHADER_SOURCE = `
uniform mat4 u_Matrix;
uniform mat4 u_Narmal; // 法向量变换矩阵
attribute vec4 a_Position;

attribute vec4 a_NormalVector; // 顶点法向量
varying vec4 v_NormalVector;

attribute vec4 a_Color;
varying vec4 v_Color;


void main () {
  gl_Position = u_Matrix * a_Position;
  v_Color = a_Color;
  v_NormalVector = u_Narmal * a_NormalVector;
}
`;
const FSHADER_SOURCE = `
precision mediump float;
varying vec4 v_Color;
varying vec4 v_NormalVector; // 法向量

uniform vec4 u_LEnv; // 环境光

uniform vec4 u_LParallel; // 平行光
uniform vec3 u_LParallelDir; // 平行光方向

void main () {
  vec3 normal = normalize(vec3(v_NormalVector)); // 归一化法向量

  // 反射系数
  float kd = 0.9;
  // 计算平行光漫反射
  vec4 lParalle = kd * u_LParallel * max(0.0, dot(normal, u_LParallelDir));

  gl_FragColor = v_Color * (u_LEnv + lParalle);
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

  const light = {
    // 环境光照
    env: new Float32Array([0.1, 0.1, 0.1, 1]),
    // 平行光
    parallel: {
      dir: vec3.normalize(vec3.create(), new Float32Array([1, 1, 1])), // 归一化方向
      value: new Float32Array([1, 1, 1, 1]), // 强度和颜色
    },
  };

  // 顶点数据
  var vertexs = Cube.vertexs;
  // 顶点颜色数据
  var colors = new Float32Array(Cube.colors.colorful);
  // 元素索引数据
  var elements = new Uint8Array(Cube.indices);
  const n = elements.length;

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 模型变换餐护士
  const modelParam = {
    zScale: 1,
  };

  // 视图变换默认角度
  const initAngle = {
    y: Math.PI * (0 / 180),
    x: Math.PI * (-20 / 180),
  };

  // 视图变换的参数
  const viewParam = {
    eye: new Float32Array([0, 1.5, 3]),
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
    // 模型矩阵
    const mat4Model = mat4.rotateY(mat4.create(), mat4.create(), modelParam.zScale);

    // 顶点法向量的矩阵，模型矩阵的逆转置矩阵
    const matNarmal = mat4.invert(mat4.create(), mat4.transpose(mat4.create(), mat4Model));

    // 生成透视投影矩阵
    const { fov, aspect, near, far } = perspectiveParam;
    const mat4Perspective = mat4.perspective(mat4.create(), fov, aspect, near, far);

    // 生成视图变换矩阵
    const { eye, front, up } = viewParam;
    const mat4LookAt = mat4.lookAt(mat4.create(), eye, vec3.add(vec3.create(), eye, front), up);

    let mat = mat4.multiply(mat4.create(), mat4LookAt, mat4Model);
    mat = mat4.multiply(mat4.create(), mat4Perspective, mat);

    initVertexBuffers({ gl, vertexs, colors, perspective: mat, matNarmal });
    initElementBuffer(gl, elements);
    initLight({
      gl,
      lEnv: light.env,
      lParallel: light.parallel.value,
      lParallelDir: light.parallel.dir,
    });

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }

  function frameLoop() {
    requestAnimationFrame(() => {
      modelParam.zScale += 0.002;
      render();
      frameLoop();
    });
  }
  frameLoop();

  bindPerspectiveEvent({ view: viewParam, canvas, yScale: initAngle.y, xScale: initAngle.x });
}

/**
 * 初始化顶点缓冲区
 *
 * @param {{
 * gl: WebGLRenderingContext;
 * vertexs: Float32Array; // 顶点
 * colors: Float32Array; // 顶点颜色
 * perspective: Float32Array; // 透视矩阵
 * matNarmal: Float32Array; // 顶点法向量矩阵
 * }} param0
 */
function initVertexBuffers({ gl, vertexs, colors, perspective, matNarmal }) {
  // 绑定顶点
  glSet32ArrayBuffer({ gl, index: getLocaltiona(gl, "a_Position"), value: vertexs, size: 3, stride: 3, offset: 0 });

  // 绑定颜色
  glSet32ArrayBuffer({ gl, index: getLocaltiona(gl, "a_Color"), value: colors, size: 3, stride: 3, offset: 0 });

  // 绑定法向量
  glSet32ArrayBuffer({
    gl,
    index: getLocaltiona(gl, "a_NormalVector"),
    value: Cube.normalVectors,
    size: 3,
    stride: 3,
    offset: 0,
  });

  // 绑定空间变换矩阵
  const u_Matrix = getLocaltionu(gl, "u_Matrix");
  gl.uniformMatrix4fv(u_Matrix, false, perspective);

  // 绑定法向量变换矩阵
  const u_Narmal = getLocaltionu(gl, "u_Narmal");
  gl.uniformMatrix4fv(u_Narmal, false, matNarmal);
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

/**
 * 初识化光照
 *
 * @param {{
 * gl: WebGLRenderingContext;
 * lEnv: Float32Array; // 环境光
 * lParallel: Float32Array; // 平行光
 * lParallelDir: Float32Array; // 平行光方向
 * }} param0
 */
function initLight({ gl, lEnv, lParallel, lParallelDir }) {
  // 环境光
  const u_LEnv = getLocaltionu(gl, "u_LEnv");
  gl.uniform4fv(u_LEnv, lEnv);

  // 平行光
  const u_LParallel = getLocaltionu(gl, "u_LParallel");
  gl.uniform4fv(u_LParallel, lParallel);
  const u_LParallelDir = getLocaltionu(gl, "u_LParallelDir");
  gl.uniform3fv(u_LParallelDir, lParallelDir);
}

main();
