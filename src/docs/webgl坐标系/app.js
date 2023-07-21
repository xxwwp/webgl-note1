// 顶点着色器程序
const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color; 

void main () {
  gl_Position = a_Position; 
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

  // 开启深度绘制
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  function render(z = 0.0) {
    const n = initVertexBuffers(gl, z); // 初始化顶点缓冲区
    // 清除颜色缓冲区和深度缓冲区
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }

  render();

  document.getElementById("zInput").oninput = (ev) => {
    const value = ev.target.value;
    const span = ev.target.nextElementSibling;
    span.innerText = value;
    render(parseFloat(value));
  };
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} z
 */
function initVertexBuffers(gl, z) {
  function getLocationa(name) {
    const location = gl.getAttribLocation(gl.program, name);
    if (location < 0 || location === null) throw Error(`着色器变量 ${name} 地址未找到`);
    return location;
  }

  const a_Position = getLocationa("a_Position");
  const a_Color = getLocationa("a_Color");

  const vertexs = new Float32Array(
    [
      [-0.8, -0.5, 0, 0, 1, 1], // xyz 坐标 rgb 颜色
      [0.8, -0.5, 0, 0, 1, 1],
      [-0.5, 0.5, 0, 0, 1, 1],
      [0.8, -0.5, z, 1, 0, 1], // xyz 坐标 rgb 颜色
      [0.2, -0.5, z, 1, 0, 1],
      [0.5, 0.5, z, 1, 0, 1],
    ].flat(2)
  );
  const FSIZE = vertexs.BYTES_PER_ELEMENT;

  const vertexBuffers = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers);
  gl.bufferData(gl.ARRAY_BUFFER, vertexs, gl.STATIC_DRAW);

  // 绑定 a_Position
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.enableVertexAttribArray(a_Position);

  // 绑定 a_Color
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Color);

  return 6;
}

main();
