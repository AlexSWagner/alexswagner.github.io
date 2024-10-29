const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

// Set initial canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Shaders
const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_position;
    void main() {
        vec2 position = a_position + u_position;
        vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec3 u_color;
    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

// Create shaders
function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

// Create program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Create circle
const points = [];
const segments = 32;
const radius = 20;
for (let i = 0; i <= segments; i++) {
    const angle = i * Math.PI * 2 / segments;
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
}

// Set up buffers
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

// Get locations
const positionLocation = gl.getAttribLocation(program, 'a_position');
const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
const positionUniformLocation = gl.getUniformLocation(program, 'u_position');
const colorLocation = gl.getUniformLocation(program, 'u_color');

gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Ball properties
let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = 4;
let dy = 4;
let time = 0;

// Animation loop
function draw() {
    // Update position
    x += dx;
    y += dy;
    
    // Bounce off walls
    if (x < radius || x > canvas.width - radius) dx = -dx;
    if (y < radius || y > canvas.height - radius) dy = -dy;
    
    // Clear canvas
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Update uniforms
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(positionUniformLocation, x, y);
    
    // Update color
    time += 0.02;
    const r = Math.sin(time) * 0.5 + 0.5;
    const g = Math.sin(time + 2.0) * 0.5 + 0.5;
    const b = Math.sin(time + 4.0) * 0.5 + 0.5;
    gl.uniform3f(colorLocation, r, g, b);
    
    // Draw
    gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length / 2);
    
    requestAnimationFrame(draw);
}

draw(); 
