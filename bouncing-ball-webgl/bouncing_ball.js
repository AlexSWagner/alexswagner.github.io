const canvas = document.getElementById("webgl-canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    console.error("WebGL not supported in this browser.");
}

// Vertex shader source
const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_translation;
    
    void main() {
        vec2 position = a_position + u_translation;
        vec2 normalized = position / u_resolution * 2.0 - 1.0;
        gl_Position = vec4(normalized * vec2(1, -1), 0, 1);
    }
`;

// Fragment shader source
const fragmentShaderSource = `
    precision mediump float;
    uniform vec3 u_color;
    
    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

// Create and compile shaders
function createShader(type, source) {
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

// Create shader program
const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

// Get attribute and uniform locations
const positionLocation = gl.getAttribLocation(program, "a_position");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
const translationLocation = gl.getUniformLocation(program, "u_translation");
const colorLocation = gl.getUniformLocation(program, "u_color");

// Create circle vertices
function createCircle(radius, segments) {
    const vertices = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    return vertices;
}

// Create buffer and load vertices
const vertices = createCircle(30, 32);
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Initialize ball state
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let speedX = 5;
let speedY = 5;
let time = 0;

// Handle canvas resize
function resizeCanvas() {
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;
    
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    // Keep ball in bounds after resize
    ballX = Math.min(Math.max(ballX, 30), canvas.width - 30);
    ballY = Math.min(Math.max(ballY, 30), canvas.height - 30);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Animation loop
function render() {
    // Clear canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Update ball position
    ballX += speedX;
    ballY += speedY;
    
    // Bounce off walls
    if (ballX < 30 || ballX > canvas.width - 30) speedX *= -1;
    if (ballY < 30 || ballY > canvas.height - 30) speedY *= -1;
    
    // Update color
    time += 0.02;
    const r = Math.sin(time) * 0.5 + 0.5;
    const g = Math.sin(time + 2) * 0.5 + 0.5;
    const b = Math.sin(time + 4) * 0.5 + 0.5;
    
    // Draw ball
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(translationLocation, ballX, ballY);
    gl.uniform3f(colorLocation, r, g, b);
    
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
    
    requestAnimationFrame(render);
}

render();
