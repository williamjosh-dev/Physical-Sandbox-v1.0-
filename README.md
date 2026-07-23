# Physical Sandbox v1.0

This project is a web tool that turns text prompts into 3D physics simulations. it uses your computer s graphics card (GPU) through WebGL to handle thousands of moving objects at smooth 60 frames per second inside your browser(such as microsoft edge or chrome).

## Tech Stack and Structure

The project has a separate frontend for the web interface and a backend for processing data.

* **Frontend**: Uses React, Three.js, and TypeScript to show the 3D graphics and run the physics calculations on the GPU.
* **Backend**: Uses a Python API to read the text prompts and calculate how the shapes should first appear in the 3D space.

### Project Structure

```text
Physical-Sandbox-v1.0-/
├── backend/                         # Python backend code
│   ├── app/                         
│   │   ├── main.py                  # API routes and server start
│   │   └── geometry_engine.py       # Turns text prompts into 3D shapes
│   └── requirements.txt             # Python packages needed
├── docs/                            # Documentation files
│   └── geometry-builder-guide.md    # Guide for using the API
└── frontend/                        # React web interface code
    ├── src/
    │   ├── components/              # UI parts like input bars and panels
    │   │   ├── feedterminal.tsx     # Shows system logs and status
    │   │   ├── inputconsole.tsx     # Where users type text prompts
    │   │   └── sandboxcanvas.tsx    # Sets up the 3D viewing screen
    │   ├── core/                    # Handles the main animation loop
    │   ├── shaders/                 # GPU code for physics math
    │   │   └── GPGPUfragments.ts    # Code for speed and gravity
    │   ├── App.tsx                  # Main layout and backend connection
    │   └── main.tsx                 # Web page entry point
    ├── package.json                 # Frontend packages needed
    └── vite.config.ts               # Build tools and server setup
```

## Quick Start

### 1. Start the Python Backend
Go to the backend folder, install the required packages, and run the server:
```bash
cd backend
pip install requirements.txt
python app/main.py
```

### 2. Start the Frontend
Open a new terminal window, go to the frontend folder, install the packages, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your web browser to use the app.

## How it Works

1. **Text Input**: You type a request (for example: "Create a heavy group of objects pulling everything into the center").
2. **Backend Setup**: The Python backend reads your text and calculates where the shapes and speeds should start.
3. **GPU Setup**: The frontend takes these starting points and sends them to the graphics card as image data.
4. **Physics Loop**: On every frame, the GPU code reads the positions from the last frame, calculates the gravity and movement, and updates the shapes instantly.

## Contributing

If you want to make the physics faster or add new features, feel free to fork the repository, make a branch with your changes, and open a pull request!
