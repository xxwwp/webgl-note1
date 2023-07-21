import { mat4, vec3 } from "../../lib/cdn.jsdelivr.net_npm_gl-matrix@3.4.3_+esm.js";

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

  const n = 50;
  const vertexs = new Float32Array(
    Array.from({ length: n })
      .map((_, index) => {
        const step = -0.8 - index * 0.2 - 0.001;
        return [
          [-0.8, -0.5, step, index === 0 ? 1 : 0, Math.random(), Math.random()], // xyz 坐标 rgb 颜色
          [-0.2, -0.5, step, index === 0 ? 1 : 0, Math.random(), Math.random()],
          [-0.5, 0.5, step, index === 0 ? 1 : 0, Math.random(), Math.random()],
        ];
      })
      .flat(3)
  );

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 视图变换的参数
  const viewParam = {
    eye: new Float32Array([0, 0, 0]),
    front: new Float32Array([0, 0, -1]), // 这里不使用注视点，使用注视方向的向量
    up: new Float32Array([0, 1, 0]),
  };

  // 透视投影的参数
  const perspectiveParam = {
    fov: Math.PI / 2,
    aspect: 1,
    near: 0.00001,
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

    initVertexBuffers(gl, vertexs, mat);

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n * 3);
  }

  render();
  bindEvent({ view: viewParam, perspective: perspectiveParam }, render);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} vertexs
 * @param {Float32Array} perspective
 */
function initVertexBuffers(gl, vertexs, perspective) {
  function getLocaltiona(name) {
    const location = gl.getAttribLocation(gl.program, name);
    if (location < 0 || location === null) throw Error(`获取变量 ${name} 地址失败`);
    return location;
  }
  function getLocaltionu(name) {
    const location = gl.getUniformLocation(gl.program, name);
    if (location < 0 || location === null) throw Error(`获取变量 ${name} 地址失败`);
    return location;
  }

  const a_Position = getLocaltiona("a_Position");
  const a_Color = getLocaltiona("a_Color");
  const u_Matrix = getLocaltionu("u_Matrix");

  const FSIZE = vertexs.BYTES_PER_ELEMENT;

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexs, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  gl.uniformMatrix4fv(u_Matrix, false, perspective);
}

/**
 *
 * @param {object} param0 相关矩阵参数
 * @param {object} param0.view 视图矩阵参数
 * @param {Function} renderFn 渲染函数
 */
function bindEvent({ view }, renderFn) {
  const canvas = document.getElementById("webgl");

  canvas.onfocus = () => {
    canvas.onkeydown = (ev) => {
      const key = ev.key;
      // 移动速率
      const speed = 0.01;
      const { eye, front, up } = view;
      // 叉乘向上和前方得到第三条 x 轴的反方向，这里使用的右手坐标系
      const xPosition = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), up, front));
      const normalizeUp = vec3.normalize(vec3.create(), up);

      let offset;
      // 计算正反方向偏移量
      if (key === "w" || key === "s") {
        offset = vec3.scale(vec3.create(), front, speed * (key === "w" ? 1 : -1));
      } else if (key === "a" || key === "d") {
        offset = vec3.scale(vec3.create(), xPosition, speed * (key === "a" ? 1 : -1));
      } else if (key === "t" || key === "b") {
        offset = vec3.scale(vec3.create(), normalizeUp, speed * (key === "t" ? 1 : -1));
      }

      if (offset !== null) {
        view.eye = vec3.add(vec3.create(), eye, offset);
        renderFn();
      }
    };
  };

  canvas.onblur = () => {
    canvas.onkeydown = null;
    canvas.onmousedown;
  };

  let yScaleAngle = 0; // 绕 y 轴旋转差值 用作鼠标左右移动
  let xScaleAngle = 0; // 绕 x 轴旋转差值 用作鼠标上下移动

  canvas.onmousedown = () => {
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
      view.front = new Float32Array([
        -Math.sin(yScaleAngle) * Math.cos(xScaleAngle),
        Math.sin(xScaleAngle),
        -Math.cos(yScaleAngle) * Math.cos(xScaleAngle),
      ]);
      // 同步旋转向上方向
      // view.up = new Float32Array([
      //   Math.sin(yScaleAngle) * Math.sin(xScaleAngle),
      //   Math.cos(xScaleAngle),
      //   Math.cos(yScaleAngle) * Math.sin(xScaleAngle),
      // ]);

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

main();
