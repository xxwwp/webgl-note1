import { vec3 } from "./cdn.jsdelivr.net_npm_gl-matrix@3.4.3_+esm.js";
/** @typedef {{front: number; up: number; eye: number }} View */

/**
 *
 *
 * @param {{view: View; canvas: HTMLCanvasElement; yScale?: number; xScale: number}} param0 相关矩阵参数
 * @param param0.view 视图矩阵参数
 * @param param0.canvas canvas 元素
 * @param param0.yScale y 轴旋转量
 * @param param0.xScale x 轴旋转量
 * @param {Function} renderFn 渲染函数
 */
export function bindPerspectiveEvent({ view, canvas, yScale, xScale }, renderFn = () => {}) {
  const activeKey = {
    w: false,
    a: false,
    s: false,
    d: false,
    t: false,
    b: false,
  };

  // 是否正在监听按键
  let listening = false;
  // 监听按键中的函数
  function listen() {
    const speed = 0.01;
    const { eye, front, up } = view;
    // 叉乘向上和前方得到第三条 x 轴的反方向，这里使用的右手坐标系
    const xPosition = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), up, front));
    const normalizeUp = vec3.normalize(vec3.create(), up);

    let offset = {
      x: vec3.create(),
      y: vec3.create(),
      z: vec3.create(),
    };
    const { w, a, s, d, t, b } = activeKey;
    // 计算正反方向偏移量
    if (w || s) {
      offset.z = vec3.scale(vec3.create(), front, speed * (w ? 1 : -1));
    }
    if (a || d) {
      offset.x = vec3.scale(vec3.create(), xPosition, speed * (a ? 1 : -1));
    }
    if (t || b) {
      offset.y = vec3.scale(vec3.create(), normalizeUp, speed * (t ? 1 : -1));
    }

    view.eye = vec3.add(
      vec3.create(),
      eye,
      offset.x.map((x, i) => x + offset.y[i] + offset.z[i])
    );

    requestAnimationFrame(() => {
      renderFn();
      listening && listen();
    });
  }

  canvas.onfocus = () => {
    canvas.onkeydown = (ev) => {
      const key = ev.key;
      if ("wasdtb".search(key) !== -1) {
        activeKey[key] = true;

        if (!listening) {
          listening = true;
          listen();
        }
      }
    };

    canvas.onkeyup = (ev) => {
      const key = ev.key;
      if ("wasdtb".search(key) !== -1) {
        activeKey[key] = false;
      }

      if ([..."wasdtb"].every((item) => !activeKey[item])) {
        listening = false;
      }
    };
  };

  canvas.onblur = () => {
    canvas.onkeydown = null;
    canvas.onmousedown;
    [..."wasdtb"].forEach((key) => (activeKey[key] = false));
    listening = false;
  };

  let yScaleAngle = yScale ?? 0; // 绕 y 轴旋转差值 用作鼠标左右移动
  let xScaleAngle = xScale ?? 0; // 绕 x 轴旋转差值 用作鼠标上下移动

  canvas.onmousedown = (downEv) => {
    // 仅左键有效，仅不摁住 control 有效
    if (downEv.button !== 0 || downEv.ctrlKey) return;

    canvas.onmousemove = (ev) => {
      // 移动速率
      const speed = 0.01;
      // 叠加旋转角度
      yScaleAngle -= speed * ev.movementX;
      xScaleAngle -= speed * ev.movementY;

      // 设置仰角和俯角的最大值，因为我们没有同步修改向上方向，超出阈值会渲染出错
      const xAngleLimit = (89 / 180) * Math.PI;
      if (xScaleAngle > xAngleLimit) {
        xScaleAngle = xAngleLimit;
      } else if (xScaleAngle < -xAngleLimit) {
        xScaleAngle = -xAngleLimit;
      }

      // 通过旋转矩阵的结果直接修改注视方向
      view.front = viewFront(yScaleAngle, xScaleAngle);

      renderFn();
    };
  };

  canvas.onmouseleave = () => {
    canvas.onmousemove = null;
  };

  canvas.onmouseup = () => {
    canvas.onmousemove = null;
  };
}

/**
 * 根据旋转角度计算视图矩阵初始注视方向的函数
 *
 * @param {number} yScaleAngle
 * @param {number} xScaleAngle
 * @returns
 */
export function viewFront(yScaleAngle, xScaleAngle) {
  return new Float32Array([
    -Math.sin(yScaleAngle) * Math.cos(xScaleAngle),
    Math.sin(xScaleAngle),
    -Math.cos(yScaleAngle) * Math.cos(xScaleAngle),
  ]);
}

/**
 * 获取 attribute 类型变量地址
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} name
 * @returns {number}
 */
export function getLocaltiona(gl, name) {
  const location = gl.getAttribLocation(gl.program, name);
  if (location < 0 || location === null)
    throw Error(
      `获取 attribute 变量 ${name} 地址失败，location type is "${Object.prototype.toString.call(
        location
      )}，value is ${location}"`
    );

  return location;
}

/**
 * 获取 uniform 类型变量地址
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} name
 * @returns {number}
 */
export function getLocaltionu(gl, name) {
  const location = gl.getUniformLocation(gl.program, name);
  if (location < 0 || location === null)
    throw Error(
      `获取 attribute 变量 ${name} 地址失败，location type is "${Object.prototype.toString.call(
        location
      )}，value is ${location}"`
    );
  return location;
}

/**
 * 设置 Float32Array 数据到 ARRAY_BUFFER 缓冲区
 *
 * @param {{
 * gl: WebGLRenderingContext
 * index: number;       // 变量地址索引
 * value: Float32Array; // 数据
 * size: number;        // 一次性读取数据大小
 * stride: number;      // 数据间隔
 * offset: number;      // 缓冲区初识偏移量
 * }} param0
 */
export function glSet32ArrayBuffer({ gl, index, value, size, stride, offset }) {
  const FSIZE = value.BYTES_PER_ELEMENT;
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, value, gl.STATIC_DRAW);
  gl.vertexAttribPointer(index, size, gl.FLOAT, false, FSIZE * stride, FSIZE * offset);
  gl.enableVertexAttribArray(index);
}
