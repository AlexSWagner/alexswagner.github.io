const canvas = document.getElementById("webgl-canvas");
const gl = canvas.getContext("webgl");

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

// Vertex shader
const vertexShaderSource = `...`;  // Same as before
const fragmentShaderSource = `...`;  // Same as before

// Helper functions
function createShader(gl, type, source) { ... }
function createProgram(gl, vertexShader, fragmentShader) { ... }

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Define ball properties
const numSegments = 100;
const radius = Math.min(canvas.width, canvas.height) * 0.05; // Dynamic radius
const positions = [];
for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * 2 * Math.PI;
    positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

let x = canvas.width / 2;
let y = canvas.height / 2;
let xVelocity = 1.5, yVelocity = 1.5;
const uResolution = gl.getUniformLocation(program, "u_resolution");
const uTranslation = gl.getUniformLocation(program, "u_translation");
const uColor = gl.getUniformLocation(program, "u_color");

const colorChangeSpeed = 0.002;
let hue = 0;

// Click listener with scaled coordinates
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const mouseX = (event.clientX - rect.left) * dpr;
    const mouseY = (event.clientY - rect.top) * dpr;

    const distX = mouseX - x;
    const distY = mouseY - y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    if (distance <= radius) {
        xVelocity *= -1;
        yVelocity *= -1;
    }
});

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uResolution, canvas.width, canvas.height);

    hue = (hue + colorChangeSpeed) % 1.0;
    const r = Math.abs(Math.sin(hue * Math.PI * 2 + 0));
    const g = Math.abs(Math.sin(hue * Math.PI * 2 + 2));
    const b = Math.abs(Math.sin(hue * Math.PI * 2 + 4));
    gl.uniform3f(uColor, r, g, b);

    x += xVelocity;
    y += yVelocity;

    if (x + radius > canvas.width || x - radius < 0) xVelocity *= -1;
    if (y + radius > canvas.height || y - radius < 0) yVelocity *= -1;
    gl.uniform2f(uTranslation, x, y);

    const positionAttribute = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 2);

    requestAnimationFrame(drawScene);
}

gl.clearColor(0, 0, 0, 1);
drawScene();
