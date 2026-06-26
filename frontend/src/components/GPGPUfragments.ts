import * as THREE from 'three';
import { GPUComputationRenderer, Variable } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

// Simple GLSL Fragment Shader to compute particle positions over time
const positionFragmentShader = `
  uniform float uTime;
  uniform float uSpeed;

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 tmpPos = texture2D(texturePosition, uv);
    vec3 pos = tmpPos.xyz;

    // Example LLM controllable logic: Simple wave deformation
    pos.y = sin(pos.x * 2.0 + uTime * uSpeed) * 0.5;

    gl_FragColor = vec4(pos, 1.0);
  }
`;

export class GPGPUSimulator {
  private gpuCompute: GPUComputationRenderer;
  private positionVariable: Variable;
  private size: number;

  constructor(renderer: THREE.WebGLRenderer, size: number = 128) {
    this.size = size;
    this.gpuCompute = new GPUComputationRenderer(size, size, renderer);

    // Create initial data texture
    const dtPosition = this.gpuCompute.createTexture();
    this.fillPositionTexture(dtPosition);

    // Add variable to the compute renderer
    this.positionVariable = this.gpuCompute.addVariable('texturePosition', positionFragmentShader, dtPosition);
    
    // Set variable dependencies (it reads from its own previous frame)
    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable]);

    // Add custom uniforms that your LLM can manipulate later
    this.positionVariable.material.uniforms['uTime'] = { value: 0 };
    this.positionVariable.material.uniforms['uSpeed'] = { value: 1.0 };

    // Check for initialization errors
    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error('GPGPU Initialization Error:', error);
    }
  }

  private fillPositionTexture(texture: THREE.DataTexture) {
    const arr = texture.image.data;
    for (let i = 0; i < arr.length; i += 4) {
      // Map pixels to a 3D grid layout
      arr[i + 0] = (Math.random() - 0.5) * 10; // X
      arr[i + 1] = 0;                          // Y
      arr[i + 2] = (Math.random() - 0.5) * 10; // Z
      arr[i + 3] = 1;                          // W
    }
  }

  public update(time: number, speed: number): THREE.Texture {
    this.positionVariable.material.uniforms['uTime'].value = time;
    this.positionVariable.material.uniforms['uSpeed'].value = speed;
    
    // Run the computation step on the GPU
    this.gpuCompute.compute();

    // Return the resulting texture containing computed 3D positions
    return this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
  }
}
