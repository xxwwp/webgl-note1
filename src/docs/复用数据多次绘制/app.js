import { mat4, vec3, vec4 } from "../../lib/cdn.jsdelivr.net_npm_gl-matrix@3.4.3_+esm.js";
import { bindPerspectiveEvent, getLocaltiona, getLocaltionu, viewFront, glSet32ArrayBuffer } from "../../lib/me.js";
import { Cube } from "../../lib/Cube.js";

const VSHADER_SOURCE = `
uniform mat4 u_Matrix;
uniform mat4 u_MatrixModel; // 模型变换矩阵
uniform mat4 u_Narmal; // 法向量变换矩阵
attribute vec4 a_Position;

attribute vec4 a_NormalVector; // 顶点法向量
varying vec4 v_NormalVector;

attribute vec4 a_Color;
varying vec4 v_Color;

varying vec4 v_Position; // 插值后的顶点坐标

void main () {
  gl_Position = u_Matrix * a_Position;
  v_Position = u_MatrixModel * a_Position; // 对顶点进行插值
  v_Color = a_Color;
  v_NormalVector = u_Narmal * a_NormalVector;
}
`;
const FSHADER_SOURCE = `
precision mediump float;
varying vec4 v_Color;
varying vec4 v_Position;
varying vec4 v_NormalVector; // 法向量

uniform vec4 u_LEnv; // 环境光

uniform vec4 u_LParallel; // 平行光
uniform vec3 u_LParallelDir; // 平行光方向

uniform vec3 u_LPoint; // 点光源
uniform vec3 u_LPointPosition; // 点光源位置

void main () {
  vec3 normal = normalize(vec3(v_NormalVector)); // 归一化法向量

  // 反射系数
  float kd = 0.5;
  // 计算平行光漫反射
  vec4 lParalle = kd * u_LParallel * max(0.0, dot(normal, u_LParallelDir));

  // 点光源反射系数
  float kd2 = 1.0;
  // 归一化点光源方向
  vec3 pointPosition = normalize(u_LPointPosition - vec3(v_Position));
  float r = distance(u_LPointPosition, vec3(v_Position)); // 点光源半径
  // 计算点光源的漫反射
  vec4 lPoint = vec4( kd2 * u_LPoint / pow(r,2.0) * max(0.0, dot(normal, pointPosition)), 1.0);

  gl_FragColor = v_Color * (u_LEnv + lParalle + lPoint);
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
    // 点光源
    point: {
      position: new Float32Array([-2, 3, 2]), // 点光源的位置
      value: new Float32Array([10, 10, 10]), // 点光源点位球体上光的强度和颜色
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
    zScale: 0,
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
    // 透视投影矩阵
    const { fov, aspect, near, far } = perspectiveParam;
    const mat4Perspective = mat4.perspective(mat4.create(), fov, aspect, near, far);

    // 视图变换矩阵
    const { eye, front, up } = viewParam;
    const mat4LookAt = mat4.lookAt(mat4.create(), eye, vec3.add(vec3.create(), eye, front), up);

    // 预设矩阵 = 透视投影 乘以 视图变换
    const preMatrix = mat4.multiply(mat4.create(), mat4Perspective, mat4LookAt);

    // 初始化顶点缓冲区
    initVertexBuffers({ gl, vertexs, colors });
    // 初始化元素索引缓冲区
    initElementBuffer(gl, elements);
    // 初始化光照数据
    initLight({
      gl,
      lEnv: light.env,
      lParallel: light.parallel.value,
      lParallelDir: light.parallel.dir,
      lPoint: light.point.value,
      lPointPosition: light.point.position,
    });

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    const min = -1;
    const max = 2;
    // 循环绘制多个正方体
    for (let i = min; i < max; i += 1) {
      for (let j = min; j < max; j += 1) {
        drawCube({ preMatrix, translate: vec3.fromValues(i * 3, j * 3, 0) });
      }
    }
  }

  /**
   *
   * @param {{
   * preMatrix: Float32Array; // 预设矩阵，本次渲染除去模型矩阵以外的的矩阵
   * translate: Float32Array; // 平移参数
   * }} param0
   */
  function drawCube({ preMatrix, translate }) {
    // 模型矩阵
    let mat4Model = mat4.fromScaling(mat4.create(), vec3.fromValues(0.5, 0.5, 0.5));
    mat4Model = mat4.translate(mat4.create(), mat4Model, translate);
    mat4Model = mat4.rotateY(mat4.create(), mat4Model, modelParam.zScale);

    // 顶点法向量的矩阵，模型矩阵的逆转置矩阵
    const matNarmal = mat4.invert(mat4.create(), mat4.transpose(mat4.create(), mat4Model));

    // 顶点变换矩阵
    const vertexMatrix = mat4.multiply(mat4.create(), preMatrix, mat4Model);

    // 初始化模型相关矩阵
    initModel({ gl, vertexMatrix, matNarmal, matModel: mat4Model });

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  }

  function frameLoop() {
    requestAnimationFrame(() => {
      modelParam.zScale += 0.005;
      render();
      frameLoop();
    });
  }
  frameLoop();
  // render();

  bindPerspectiveEvent({ view: viewParam, canvas, yScale: initAngle.y, xScale: initAngle.x }, () => {});
}

/**
 * 初始化顶点缓冲区
 *
 * @param {{
 * gl: WebGLRenderingContext;
 * vertexs: Float32Array; // 顶点
 * colors: Float32Array; // 顶点颜色
 * }} param0
 */
function initVertexBuffers({ gl, vertexs, colors }) {
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
}

/**
 *
 * @param {{
 * gl: WebGLRenderingContext;
 * vertexMatrix: Float32Array; // 顶点变换矩阵
 * matNarmal: Float32Array; // 顶点法向量矩阵
 * matModel: Float32Array; // 模型变换矩阵
 * }} param0
 */
function initModel({ gl, vertexMatrix, matModel, matNarmal }) {
  // 绑定顶点变换矩阵
  gl.uniformMatrix4fv(getLocaltionu(gl, "u_Matrix"), false, vertexMatrix);

  // 绑定法向量变换矩阵
  gl.uniformMatrix4fv(getLocaltionu(gl, "u_Narmal"), false, matNarmal);

  // 绑定模型矩阵
  gl.uniformMatrix4fv(getLocaltionu(gl, "u_MatrixModel"), false, matModel);
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
 * lPoint: Float32Array; // 点光源
 * lPointPosition: Float32Array; // 点光源位置
 * }} param0
 */
function initLight({ gl, lEnv, lParallel, lParallelDir, lPoint, lPointPosition }) {
  // 环境光
  const u_LEnv = getLocaltionu(gl, "u_LEnv");
  gl.uniform4fv(u_LEnv, lEnv);

  // 平行光
  const u_LParallel = getLocaltionu(gl, "u_LParallel");
  gl.uniform4fv(u_LParallel, lParallel);
  const u_LParallelDir = getLocaltionu(gl, "u_LParallelDir");
  gl.uniform3fv(u_LParallelDir, lParallelDir);

  // 点光源
  gl.uniform3fv(getLocaltionu(gl, "u_LPoint"), lPoint);
  gl.uniform3fv(getLocaltionu(gl, "u_LPointPosition"), lPointPosition);
}

main();
