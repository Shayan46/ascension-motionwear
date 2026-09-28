const vertexShaderSource = `
attribute vec2 aPosition;
attribute vec2 aUv;
uniform float uYaw;
uniform float uPitch;
uniform float uAspect;
uniform float uWidth;
uniform float uHeight;
uniform float uDepth;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  float edgeCurve = 1.0 - (aPosition.x * aPosition.x);
  float bodyCurve = 0.72 + 0.28 * (1.0 - aPosition.y * aPosition.y);
  vec3 position = vec3(
    aPosition.x * uWidth,
    aPosition.y * uHeight,
    uDepth * edgeCurve * bodyCurve
  );
  vec3 normal = normalize(vec3(-2.0 * uDepth * aPosition.x / uWidth, 0.0, 1.0));

  float cp = cos(uPitch);
  float sp = sin(uPitch);
  position = vec3(position.x, position.y * cp - position.z * sp, position.y * sp + position.z * cp);
  normal = vec3(normal.x, normal.y * cp - normal.z * sp, normal.y * sp + normal.z * cp);

  float cy = cos(uYaw);
  float sy = sin(uYaw);
  position = vec3(position.x * cy + position.z * sy, position.y, -position.x * sy + position.z * cy);
  normal = vec3(normal.x * cy + normal.z * sy, normal.y, -normal.x * sy + normal.z * cy);

  float cameraDistance = 3.15;
  float perspective = 2.05 / (cameraDistance - position.z);
  gl_Position = vec4(position.x * perspective / uAspect, position.y * perspective, 0.0, 1.0);
  vUv = aUv;
  vNormal = normal;
}`;

const fragmentShaderSource = `
precision mediump float;
uniform sampler2D uTexture;
uniform vec3 uBackground;
uniform vec3 uFabric;
uniform float uCutoff;
uniform float uFeather;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec4 sampleColor = texture2D(uTexture, vUv);
  float separation = distance(sampleColor.rgb, uBackground);
  float alpha = smoothstep(uCutoff, uCutoff + uFeather, separation);
  if (alpha < 0.018) discard;

  vec3 normal = normalize(vNormal);
  vec3 lightDirection = normalize(vec3(-0.38, 0.48, 0.92));
  float diffuse = 0.68 + 0.32 * max(dot(normal, lightDirection), 0.0);
  float rim = pow(1.0 - abs(normal.z), 2.0) * 0.17;
  vec3 color;

  if (normal.z > 0.0) {
    color = sampleColor.rgb * diffuse + vec3(rim);
  } else {
    float weave = sin(vUv.y * 520.0) * 0.012 + sin(vUv.x * 410.0) * 0.009;
    float seam = 1.0 - smoothstep(0.0, 0.012, abs(vUv.x - 0.5));
    color = uFabric * (0.70 + 0.24 * diffuse + weave) - vec3(seam * 0.085);
  }

  gl_FragColor = vec4(color, alpha);
}`;

const categoryGeometry = {
  "Accessories": { width: 0.78, height: 0.88, depth: 0.28 },
  "Bottoms": { width: 0.78, height: 1.08, depth: 0.20 },
  "Gym Wear": { width: 0.86, height: 1.05, depth: 0.18 },
  "Layering": { width: 0.91, height: 1.02, depth: 0.16 },
  "Outerwear": { width: 1.02, height: 1.04, depth: 0.22 },
  "Tops": { width: 0.94, height: 1.02, depth: 0.18 },
};

const imageCache = new Map();

function loadImage(source) {
  if (!imageCache.has(source)) {
    imageCache.set(source, new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Unable to load ${source}`));
      image.src = source;
    }));
  }
  return imageCache.get(source);
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Unable to compile WebGL shader");
  }
  return shader;
}

function createProgram(gl) {
  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "Unable to link WebGL program");
  }
  return program;
}

function createMesh(gl, columns = 42, rows = 48) {
  const vertices = [];
  const indices = [];
  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      const v = row / rows;
      vertices.push(u * 2 - 1, 1 - v * 2, u, v);
    }
  }
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const current = row * (columns + 1) + column;
      const next = current + columns + 1;
      indices.push(current, next, current + 1, current + 1, next, next + 1);
    }
  }
  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
  };
}

function analyzeImage(image) {
  const sample = document.createElement("canvas");
  sample.width = 64;
  sample.height = 64;
  const context = sample.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, 64, 64);
  const pixels = context.getImageData(0, 0, 64, 64).data;
  const cornerSize = 7;
  const background = [0, 0, 0];
  let cornerCount = 0;
  for (let y = 0; y < 64; y += 1) {
    for (let x = 0; x < 64; x += 1) {
      const corner = (x < cornerSize || x >= 64 - cornerSize) && (y < cornerSize || y >= 64 - cornerSize);
      if (!corner) continue;
      const offset = (y * 64 + x) * 4;
      background[0] += pixels[offset];
      background[1] += pixels[offset + 1];
      background[2] += pixels[offset + 2];
      cornerCount += 1;
    }
  }
  background.forEach((_, index) => { background[index] /= cornerCount * 255; });

  const fabric = [0, 0, 0];
  let fabricWeight = 0;
  let maxDistance = 0;
  for (let y = 8; y < 56; y += 1) {
    for (let x = 8; x < 56; x += 1) {
      const offset = (y * 64 + x) * 4;
      const color = [pixels[offset] / 255, pixels[offset + 1] / 255, pixels[offset + 2] / 255];
      const distance = Math.hypot(color[0] - background[0], color[1] - background[1], color[2] - background[2]);
      maxDistance = Math.max(maxDistance, distance);
      const weight = Math.max(0, distance - 0.035);
      fabric[0] += color[0] * weight;
      fabric[1] += color[1] * weight;
      fabric[2] += color[2] * weight;
      fabricWeight += weight;
    }
  }
  if (fabricWeight) fabric.forEach((_, index) => { fabric[index] /= fabricWeight; });
  else fabric.splice(0, 3, 0.2, 0.2, 0.2);

  return {
    background,
    fabric,
    cutoff: Math.min(0.062, Math.max(0.014, maxDistance * 0.11)),
    feather: Math.min(0.12, Math.max(0.052, maxDistance * 0.23)),
  };
}

function normalizedDegrees(value) {
  return ((value % 360) + 360) % 360;
}

export function createGarmentViewer(canvas) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return null;

  const program = createProgram(gl);
  const mesh = createMesh(gl);
  const vertexBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const uvLocation = gl.getAttribLocation(program, "aUv");
  const uniforms = Object.fromEntries([
    "uYaw", "uPitch", "uAspect", "uWidth", "uHeight", "uDepth", "uTexture",
    "uBackground", "uFabric", "uCutoff", "uFeather",
  ].map((name) => [name, gl.getUniformLocation(program, name)]));

  gl.useProgram(program);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(uvLocation);
  gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 16, 8);
  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let textures = [];
  let sources = [];
  let analysis = { background: [0.75, 0.75, 0.75], fabric: [0.18, 0.18, 0.18], cutoff: 0.02, feather: 0.08 };
  let geometry = categoryGeometry.Tops;
  let angle = 0;
  let pitch = 0;
  let loadVersion = 0;

  function textureFromImage(image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(bounds.width * ratio));
    const height = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  }

  function render() {
    if (!textures.length) return;
    resize();
    const degrees = normalizedDegrees(angle);
    let textureIndex = 0;
    let renderedYaw = degrees;
    if (textures.length > 1) {
      textureIndex = Math.round(degrees / 90) % textures.length;
      const baseAngle = textureIndex * 90;
      renderedYaw = ((degrees - baseAngle + 540) % 360) - 180;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[textureIndex]);
    gl.uniform1i(uniforms.uTexture, 0);
    gl.uniform1f(uniforms.uYaw, renderedYaw * Math.PI / 180);
    gl.uniform1f(uniforms.uPitch, pitch * Math.PI / 180);
    gl.uniform1f(uniforms.uAspect, canvas.width / canvas.height);
    gl.uniform1f(uniforms.uWidth, geometry.width);
    gl.uniform1f(uniforms.uHeight, geometry.height);
    gl.uniform1f(uniforms.uDepth, geometry.depth);
    gl.uniform3fv(uniforms.uBackground, analysis.background);
    gl.uniform3fv(uniforms.uFabric, analysis.fabric);
    gl.uniform1f(uniforms.uCutoff, analysis.cutoff);
    gl.uniform1f(uniforms.uFeather, analysis.feather);
    gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  return {
    async setProduct(product) {
      const version = ++loadVersion;
      sources = Array.isArray(product.spin) && product.spin.length > 1 ? product.spin : [product.img];
      const images = await Promise.all(sources.map(loadImage));
      if (version !== loadVersion) return false;
      textures.forEach((texture) => gl.deleteTexture(texture));
      textures = images.map(textureFromImage);
      analysis = analyzeImage(images[0]);
      geometry = categoryGeometry[product.cat] || categoryGeometry.Tops;
      angle = 0;
      pitch = 0;
      render();
      return true;
    },
    setAngle(degrees, nextPitch = pitch) {
      angle = normalizedDegrees(degrees);
      pitch = Math.max(-12, Math.min(12, nextPitch));
      render();
    },
    resize: render,
  };
}
