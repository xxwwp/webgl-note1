gl.getExtension("OES_element_index_uint");

// 元素的索引
const elements = new Uint32Array([
  // ...
]);
// ...

gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_INT, 0);
