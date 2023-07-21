// 顶点着色器程序
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

  const n = initVertexBuffers(gl); // 初始化顶点

  gl.enable(gl.DEPTH_TEST);

  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

/**
 * 初始化顶点
 * @param {WebGLRenderingContext} gl
 */
function initVertexBuffers(gl) {
  function getLocationa(name) {
    const location = gl.getAttribLocation(gl.program, name);
    if (location < 0 || location === null) throw Error(`获取着色器变量 ${name} 地址失败`);
    return location;
  }
  function getLocationu(name) {
    const location = gl.getUniformLocation(gl.program, name);
    if (location < 0 || location === null) throw Error(`获取着色器变量 ${name} 地址失败`);
    return location;
  }
  const a_Position = getLocationa("a_Position");
  const a_Color = getLocationa("a_Color");
  const u_Perspective = getLocationu("u_Perspective");

  // 有多少排三角形
  const n = 5;
  const vertexs = new Float32Array(
    Array.from({ length: n })
      .map((_, index) => {
        const indexn = (index / n) * 2;
        return [
          [-0.8, -0.5, 1 + indexn, index === 0 ? 1 : 0, Math.random(), Math.random()], // xyz 坐标 rgb 颜色
          [-0.2, -0.5, 1 + indexn, index === 0 ? 1 : 0, Math.random(), Math.random()],
          [-0.5, 0.5, 1 + indexn, index === 0 ? 1 : 0, Math.random(), Math.random()],
        ];
      })
      .flat(3)
  );
  const FSIZE = Float32Array.BYTES_PER_ELEMENT;

  const vertexBuffers = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers);
  gl.bufferData(gl.ARRAY_BUFFER, vertexs, gl.STATIC_DRAW);

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  /// 初始化矩阵数据
  const p = {
    r: 1,
    l: -1,
    t: 1,
    b: -1,
    n: 1,
    f: 3,
  };

  const mat4Perspective = (() => {
    const { r, l, t, b, n, f } = p;
    return new Float32Array(
      [
        [(2 * n) / (r - l), 0, 0, 0], //
        [0, (2 * n) / (t - b), 0, 0],
        [(r + l) / (l - r), (t + b) / (b - t), -(f + n) / (n - f), 1],
        [0, 0, -(2 * f * n) / (f - n), 0],
      ].flat(2)
    );
  })();

  gl.uniformMatrix4fv(u_Perspective, false, mat4Perspective);

  return n * 3;
}

main();
