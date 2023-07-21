// 顶点着色器程序
const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec2 a_TexCoord; // 纹理坐标
varying vec2 v_TexCoord; // 向片元着色器传递纹理坐标

void main () {
  gl_Position = a_Position; 
  v_TexCoord = a_TexCoord;
}
`;
// 片元着色器程序
const FSHADER_SOURCE = `
precision mediump float;
uniform sampler2D u_Sampler0; // 第一个纹理
uniform sampler2D u_Sampler1; // 第二个纹理
varying vec2 v_TexCoord;

void main () {
  vec4 color0 = texture2D(u_Sampler0, v_TexCoord); // 采样对纹理 0 的纹素
  vec4 color1 = texture2D(u_Sampler1, v_TexCoord); // 采样对纹理 1 的纹素
  gl_FragColor = color0 * color1; // 把色彩进行相乘
}
`;

async function main() {
  const canvas = document.getElementById("webgl");

  /** 初始化 webgl 上下文 @type {WebGLRenderingContext | null} */
  const gl = getWebGLContext(canvas);

  if (!gl) {
    throw new Error("webgl 初始化失败");
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    throw new Error("初始化着色器程序失败");
  }

  initVertexBuffers(gl);

  await Promise.all([loadImage("../../imgs/sky.jpg"), loadImage("../../imgs/circle.gif")]).then((v) => {
    v.forEach((item, index) => {
      initTexture(gl, item, index); // 依次初始化纹理
    });
  });
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

/**
 * 初始化顶点
 * @param {WebGLRenderingContext} gl
 */
function initVertexBuffers(gl) {
  const a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    throw Error("找不到 a_Position 的存储位置");
  }

  const a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
  if (a_TexCoord < 0) {
    throw Error("找不到 a_TexCoord 的存储位置");
  }

  const vertexBuffers = gl.createBuffer();

  const vertexs = new Float32Array(
    [
      [-0.5, 0.5, 0.0, 1.0], // 顶点坐标 XY，纹理坐标 ST
      [-0.5, -0.5, 0.0, 0.0],
      [0.5, 0.5, 1.0, 1.0],
      [0.5, -0.5, 1.0, 0.0],
    ].flat(2)
  );

  const FSIZE = Float32Array.BYTES_PER_ELEMENT;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers);
  gl.bufferData(gl.ARRAY_BUFFER, vertexs, gl.STATIC_DRAW);

  // 填充顶点
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);

  // 填充纹理坐标
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);
}

//
/**
 * 载入图片
 * @param {string} src
 */
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

/**
 * 添加纹理
 * @param {WebGLRenderingContext} gl
 * @param {Image} image
 * @param {number} index 纹理单元的序号
 */
function initTexture(gl, image, index) {
  const u_Sampler = gl.getUniformLocation(gl.program, `u_Sampler${index}`);
  if (u_Sampler < 0) {
    throw Error("找不到 u_Sampler 的存储位置");
  }

  // 创建纹理
  const texture = gl.createTexture();
  if (!texture) {
    throw Error("创建纹理失败");
  }

  // 翻转纹理的 Y 坐标 180 度，注意这里是翻转，不是旋转，相当于把纹理沿水平方向旋转了 180 度
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  // 激活对应纹理单元
  gl.activeTexture(gl[`TEXTURE${index}`]);

  // 绑定纹理，这里会自动绑定到当前纹理单元
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 配置纹理参数，修改默认缩小为线性，而不是默认值 mipmap 的方式
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // 配置纹理图像
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // 把对应纹理传递给着色器
  gl.uniform1i(u_Sampler, index);
}

main();
