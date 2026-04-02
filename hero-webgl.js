// MainVoice AI — Premium WebGL Hero Background

class WebGLHero {
    constructor() {
        this.container = document.querySelector('.hero-visual');
        if (!this.container) return;

        this.canvas = document.createElement('canvas');
        this.container.innerHTML = ''; // Clear existing floating shapes
        this.container.appendChild(this.canvas);
        
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        this.time = 0;
        this.scrollY = 0;
        this.setup();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
            // 3D Parallax effect
            this.canvas.style.transform = `translate3D(0, ${this.scrollY * 0.25}px, 0) rotate(${this.scrollY * 0.015}deg)`;
        });
        this.animate();
    }

    setup() {
        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            
            // Random function
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            
            // 2D Noise based on Morgan McGuire @morgan3d
            float noise(in vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f*f*(3.0-2.0*f);
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            void main() {
                vec2 st = gl_FragCoord.xy/u_resolution.xy;
                st.x *= u_resolution.x/u_resolution.y;

                vec3 color = vec3(0.0);
                
                // Colors - Sage and Coral inspired
                vec3 color1 = vec3(0.05, 0.46, 0.43); // Sage #0f766e
                vec3 color2 = vec3(0.85, 0.15, 0.46); // Coral #db2777
                vec3 color3 = vec3(0.8, 0.98, 0.94); // Light sage #ccfbf1
                vec3 color4 = vec3(0.98, 0.9, 0.95); // Light coral #fce7f3

                // Center coordinates for moving orbs
                vec2 pos1 = vec2(0.3 + sin(u_time * 0.5) * 0.2, 0.5 + cos(u_time * 0.3) * 0.2);
                vec2 pos2 = vec2(0.7 + cos(u_time * 0.4) * 0.2, 0.4 + sin(u_time * 0.6) * 0.2);
                
                float d1 = distance(st, pos1);
                float d2 = distance(st, pos2);
                
                // Extra soft radial fade to canvas edges to ensure NO hard cuts
                vec2 center = vec2(0.5, 0.5);
                center.x *= u_resolution.x/u_resolution.y; // Match aspect ratio
                float distToCenter = distance(st, center);
                float edgeFade = smoothstep(0.65, 0.35, distToCenter); // Fades completely out well before edge
                
                // Add noise to distances for distortion
                float n = noise(st * 3.0 + u_time * 0.2) * 0.15;
                d1 += n;
                d2 -= n;

                float blob1 = smoothstep(0.7, 0.0, d1);
                float blob2 = smoothstep(0.7, 0.0, d2);
                
                // Mix colors smoothly
                color = mix(color3, color1, blob1 * 0.9);
                color = mix(color, color2, blob2 * 0.8);
                
                // Overall opacity with strict edge fading
                float rawAlpha = smoothstep(0.0, 0.4, blob1 + blob2);
                float alpha = rawAlpha * edgeFade;

                gl_FragColor = vec4(color, alpha * 0.95);
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);

        const vertices = new Float32Array([
            -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0, -1.0,  1.0,  1.0
        ]);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, "position");
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.resolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution");
        this.timeLocation = this.gl.getUniformLocation(this.program, "u_time");
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.container.getBoundingClientRect();
        
        // Ensure standard dimensions if container is sizing dynamically incorrectly
        const width = rect.width > 0 ? rect.width : 500;
        const height = rect.height > 0 ? rect.height : 500;

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
    }

    animate() {
        this.time += 0.01;
        this.gl.uniform1f(this.timeLocation, this.time);
        
        // Enable blending
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure styles are applied
    setTimeout(() => {
        new WebGLHero();
    }, 100);
});
