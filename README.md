# Physical Sandbox v1.0

A high-performance, web-based physics simulation sandbox built with modern web technologies. This project leverages GPU acceleration to handle complex physical computations directly on the graphics hardware, providing a fluid and interactive experience.

## 🚀 Features

- **GPGPU-Powered Physics**: Utilizes the `GPUComputationRenderer` to offload heavy physical simulations (such as particles, fluids, or flocking) to the GPU using fragment shaders, enabling thousands of simultaneous calculations.
- **Hybrid 3D Rendering**: Combines Three.js WebGL rendering for high-fidelity 3D graphics with the `CSS3DRenderer` to integrate interactive HTML/DOM elements seamlessly within the 3D environment.
- **Type-Safe Development**: Built with **TypeScript** to ensure code reliability and a robust development experience.
- **Reactive UI**: Leverages **React** for a component-based user interface that manages simulation parameters and state effectively.
- **Real-time Interaction**: Designed for immediate feedback, allowing users to modify simulation variables and see the results instantly in a physical "playground."

## 🛠️ Technology Stack

- **Core Engine**: Three.js
- **Frontend Framework**: React
- **Programming Language**: TypeScript
- **GPU Computing**: GPGPU via Custom Fragment Shaders
- **Transpilation**: Babel

## 📦 Getting Started

### Prerequisites

- **Node.js** (Latest LTS version recommended)
- **npm** or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd "physical sandbox v1.0"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running the Application

To start the development server and launch the sandbox:
```bash
npm start
```

## 📄 License

This project is developed as an open-source sandbox. Please refer to the license files in the `node_modules` for third-party library attributions.