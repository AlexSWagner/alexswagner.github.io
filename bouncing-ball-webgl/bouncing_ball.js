const canvas = document.getElementById("webgl-canvas");
const gl = canvas.getContext("webgl");

// Set up canvas size to be responsive
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

if (!gl) {
    console.error("WebGL not supported in this browser.");
}

// Vertex shader source code
const vertexShaderSource = `
    attribute vec2 position;
    uniform vec2 u_translation;
    uniform vec2 u_resolution;

    void main() {
        vec2 zeroToOne = (position + u_translation) / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
`;

// Fragment shader source code
const fragmentShaderSource = `
    precision mediump float;
    uniform vec3 u_color;

    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

// Helper functions for creating and linking shaders
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Define geometry for the ball
const numSegments = 100;
const radius = Math.min(canvas.width, canvas.height) * 0.05; // Dynamic radius
const positions = [];
for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * 2 * Math.PI;
    positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
}

// Create buffer and load the circle vertices
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Initialize ball position, velocity, and color cycling
let x = canvas.width / 2;
let y = canvas.height / 2;
let xVelocity = 1.5, yVelocity = 1.5;
const uResolution = gl.getUniformLocation(program, "u_resolution");
const uTranslation = gl.getUniformLocation(program, "u_translation");
const uColor = gl.getUniformLocation(program, "u_color");

const colorChangeSpeed = 0.002;
let hue = 0;

// Render each frame and update the ball's position and color
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set canvas resolution and ball color
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    hue = (hue + colorChangeSpeed) % 1.0;
    const r = Math.abs(Math.sin(hue * Math.PI * 2 + 0));
    const g = Math.abs(Math.sin(hue * Math.PI * 2 + 2));
    const b = Math.abs(Math.sin(hue * Math.PI * 2 + 4));
    gl.uniform3f(uColor, r, g, b);

    // Update the ball's position and reverse direction on canvas edges
    x += xVelocity;
    y += yVelocity;

    if (x + radius > canvas.width || x - radius < 0) xVelocity *= -1;
    if (y + radius > canvas.height || y - radius < 0) yVelocity *= -1;
    gl.uniform2f(uTranslation, x, y);

    // Set up position attribute and draw the ball
    const positionAttribute = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 2);

    requestAnimationFrame(drawScene);
}

// Set canvas background color and start the animation
gl.clearColor(0, 0, 0, 1);
drawScene();
