# 3D Geometry Builder - User Guide

## Overview

The Physical Sandbox now supports **custom 3D object generation** using the same consistent formula approach. You can now ask the LLM to build arbitrary 3D objects like:
- ✅ Red boxes
- ✅ Wooden tables  
- ✅ Blue chairs
- ✅ Buildings
- ✅ Pyramids
- ✅ Any combination of shapes

## How It Works

### Detection System
The system automatically detects whether you're asking for:
1. **Physics Simulation** - "launch a rocket", "fly an aircraft"
2. **3D Object** - "build a red box", "create a wooden table"

### Object Generation Formula

When you describe an object, the LLM processes it through this consistent formula:

```
[Object Type] + [Color] + [Position] + [Dimensions] = 3D Model
```

**Examples:**
```
"build a red box"                    → Red box at default position
"create a wooden table width 2"      → Table 2 units wide with wood texture
"blue chair at position 1,0,0"       → Blue chair placed at (1,0,0)
"tall gray building height 5"        → 5-unit tall building with windows
"gold pyramid"                        → Golden pyramid
```

## Supported Objects

### Basic Shapes
- **box** - Rectangular prism, customize with width/height/depth
- **sphere** - Ball shape, customize radius
- **cylinder** - Tube shape, customize radius and height
- **cone** - Cone shape
- **torus** - Ring/donut shape

### Compound Objects
- **table** - 4-legged table with customizable dimensions
- **chair** - Chair with seat, back, and 4 legs
- **building** - Multi-story building with windows
- **pyramid** - Layered pyramid

## Usage Examples

### Example 1: Simple Red Box
**Request:**
```json
{
  "prompt": "build a red box size 1,2,1 at 0,0,0"
}
```

**Generated 3D Object:**
- 1 red box at (0, 0, 0) with dimensions 1×2×1

---

### Example 2: Wooden Table
**Request:**
```json
{
  "prompt": "create a wooden table width 2 depth 1 at position 1,0,0"
}
```

**Generated 3D Object:**
- 1 wooden table top at (1, 0.7, 0)
- 4 brown wooden legs

---

### Example 3: Multi-Story Building
**Request:**
```json
{
  "prompt": "build a gray building height 5 width 2"
}
```

**Generated 3D Object:**
- 1 gray main building box
- 9 cyan window elements (3x3 grid)
- 1 orange roof cone on top

---

### Example 4: Blue Chair
**Request:**
```json
{
  "prompt": "make a blue chair at 0,0,1"
}
```

**Generated 3D Object:**
- 1 blue seat (horizontal box)
- 1 blue backrest
- 4 brown legs

## Syntax Reference

### Color Specification
Use color names or hex codes:

**Named Colors:**
```
red, blue, green, yellow, white, black, gray, cyan, magenta, 
orange, purple, brown, pink, gold, silver, wood
```

**Hex Format:**
```
0xff0000 (red), 0x0000ff (blue), 0x00ff00 (green)
```

### Position Format
```
"at X,Y,Z" or "position X,Y,Z"
Examples:
  - "at 0,0,0"
  - "position 1,0.5,2"
```

### Dimension Format
```
"size X,Y,Z" for boxes
"width X" for tables/buildings
"height Y" for buildings/cylinders
"depth Z" for tables
"radius R" for spheres/cylinders

Examples:
  - "size 1,2,1" → box 1×2×1
  - "width 2 depth 1" → 2×1 table
  - "height 5 width 3" → 5 units tall, 3 units wide
  - "radius 0.5" → 0.5 unit radius sphere
```

## Advanced Composition

You can describe more complex scenes by combining shapes:

```
"build a red box at 0,0,0 then add a blue sphere at 1,0,0"
```

Or describe a complete scene:

```
"create an office: wooden desk width 2, blue office chair at 1,0,0, 
gray filing cabinet at 2,0,0"
```

## Technical Details

### Geometry Components
Each object is built from basic geometric components:

```python
GeometryComponent:
  - shape: str (box, sphere, cylinder, cone, torus)
  - scale: (width, height, depth)
  - position: (x, y, z)
  - color: hex string (0xRRGGBB)
  - rotation: (rx, ry, rz) in radians
  - wireframe: bool (optional)
```

### Blueprint Format (Backend Response)
```json
{
  "shape": "box",
  "scale": [1.0, 2.0, 1.0],
  "position": [0.0, 1.0, 0.0],
  "color": "0xff0000",
  "rotation": [0.0, 0.0, 0.0],
  "wireframe": false
}
```

## Performance Notes

- **Simple Objects** (1-2 components): < 100ms
- **Compound Objects** (4-6 components): < 200ms
- **Complex Objects** (10+ components): < 500ms

The frontend automatically normalizes large objects to fit the viewport.

## Mixing Physics & Objects

You can still use the physics simulation features:

**Physics:** 
```
"launch a rocket with mass 50000kg"
```

**Object:**
```
"build a red box"
```

The system automatically detects which mode you want!

## Common Patterns

### Pattern 1: Colored Object
```
[COLOR] [OBJECT_TYPE]
"red box", "blue chair", "wooden table"
```

### Pattern 2: Dimensioned Object
```
[COLOR] [OBJECT_TYPE] [DIMENSION]s [POSITION]
"red box size 1,1,1 at 0,0,0"
"wooden table width 2 depth 1 at 1,0,0"
```

### Pattern 3: Building
```
[COLOR] [building/house] height [H] width [W]
"gray building height 5 width 3"
```

### Pattern 4: Scene
```
[ACTION] [COLOR] [OBJECT] [POSITION]
"build a red table at 0,0,0"
"create a blue chair at 1,0,0"
"make a golden pyramid at 2,0,2"

## Integration with Frontend

When you send a prompt requesting object generation:

1. **Detection** - Backend detects it's an object request
2. **LLM Processing** - LLM structures the description
3. **Geometry Building** - ObjectBuilder creates components
4. **Blueprint Generation** - Components converted to 3D blueprint
5. **Rendering** - Frontend renders components in 3D canvas

## Troubleshooting

**Issue:** Object appears too small or too large
- **Solution:** Adjust size parameters (size, width, height, depth)

**Issue:** Object position is off
- **Solution:** Use explicit position "at X,Y,Z"

**Issue:** Color not appearing
- **Solution:** Use recognized color names or hex format "0xRRGGBB"

**Issue:** Object looks deformed
- **Solution:** Ensure dimensions match object type (tables need width/depth, buildings need height/width)

## Example Workflow

1. Type: `"build a red box"`
   - ✅ Gets detected as object request
   - ✅ LLM structures it
   - ✅ Geometry builder creates box
   - ✅ Rendered in canvas

2. Type: `"create a wooden table width 2 depth 1 at 1,0,0"`
   - ✅ LLM understands table parameters
   - ✅ Geometry builder creates 5-component table
   - ✅ All components rendered with proper wood color

3. Type: `"build a gray building height 5"`
   - ✅ LLM interprets building request
   - ✅ Geometry builder creates main building + windows + roof
   - ✅ Multi-component building rendered

---

**Happy building!** 🎨📦
