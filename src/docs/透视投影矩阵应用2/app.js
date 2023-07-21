import { mat4 } from "../../lib/cdn.jsdelivr.net_npm_gl-matrix@3.4.3_+esm.js";

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_Perspective; // 透视投影矩阵
varying vec4 v_Color;

void main () {
  gl_Position = u_Perspective * a_Position;
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
        const step = -1 - index * 0.2 - 0.001;
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

  const perspectiveParam = {
    fov: Math.PI / 2,
    aspect: 1,
    near: 1,
    far: 3,
  };

  function render() {
    const { fov, aspect, near, far } = perspectiveParam;
    const mat4Perspective = mat4.perspective(mat4.create(), fov, aspect, near, far);

    initVertexBuffers(gl, vertexs, mat4Perspective);

    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n * 3);
  }

  render();
  bindEvent(perspectiveParam, render);
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
  const u_Perspective = getLocaltionu("u_Perspective");

  const FSIZE = vertexs.BYTES_PER_ELEMENT;

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexs, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  gl.uniformMatrix4fv(u_Perspective, false, perspective);
}

// 绑定相关滑轮事件
function bindEvent(params, renderFn) {
  document.getElementById("fov").oninput = (ev) => {
    const value = parseFloat(ev.target.value);
    ev.target.nextElementSibling.innerText = value;

    params.fov = value * Math.PI;
    renderFn();
  };

  ["aspect", "near", "far"].map((id) => {
    const el = document.getElementById(id);

    el.oninput = (ev) => {
      const value = parseFloat(ev.target.value);
      ev.target.nextElementSibling.innerText = value;

      params[id] = value;
      renderFn();
    };
  });
}

main();
