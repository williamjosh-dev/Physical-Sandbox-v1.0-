# 3D Geometry Builder - Quick Reference Cheat Sheet

## Common Commands

### Basic Objects
```
"build a red box"
"blue sphere"
"green cylinder"
"yellow cone"
"purple torus"
```

### Sized Objects
```
"red box size 2,1,1"
"blue sphere radius 1.5"
"cylinder height 3 radius 0.5"
```

### Positioned Objects
```
"red box at 0,0,0"
"blue chair position 1,0,0"
"box at 0,1,2"
```

### Furniture
```
"wooden table"
"wooden table width 2 depth 1"
"blue chair"
"red chair at 1,0,0"
"wooden desk width 1.5"
```

### Structures
```
"gray building"
"building height 5 width 3"
"gold pyramid"
"tall building"
"red brick building"
```

---

## Color Names
```
red        orange      yellow      green
cyan       blue        purple      magenta
white      black       gray        brown
pink       gold        silver      wood
```

---

## Dimension Keywords
```
size:      "size 1,2,3"
width:     "width 2"
height:    "height 5"
depth:     "depth 1"
radius:    "radius 0.5"
```

---

## Position Keywords
```
at:        "at 0,0,0"
position:  "position 1,0,0"
```

---

## Object Keywords
| Type | Keywords |
|------|----------|
| Box | box, cube, block, crate |
| Sphere | sphere, ball, orb |
| Cylinder | cylinder, pillar, column, tube |
| Cone | cone |
| Torus | torus, ring, donut |
| Table | table, desk |
| Chair | chair, seat |
| Building | building, house, skyscraper |
| Pyramid | pyramid |

---

## Build Action Keywords
```
build       create      make
generate    design      construct
```

---

## Full Examples
```
1. "build a red box"
   → Red box at center

2. "create a wooden table width 2 depth 1"
   → Wooden table with size and 4 legs

3. "blue chair at position 1,0,0"
   → Blue chair positioned at (1,0,0)

4. "make a gray building height 5"
   → Gray building with windows

5. "gold pyramid at 0,0,0"
   → Golden pyramid at origin

6. "cyan sphere radius 2 at 2,0,2"
   → Large cyan sphere at (2,0,2)
```

---

## Hex Colors
```
#ff0000 = red      #0000ff = blue     #00ff00 = green
#ffff00 = yellow   #00ffff = cyan     #ff00ff = magenta
#ffffff = white    #000000 = black
```

---

## Tips & Tricks

### Default Values
```
No position?     → centered at (0,0,0)
No color?        → light gray default
No size?         → standard size based on object type
```

### Natural Language
```
"tall" building   → increased height
"wide" table      → increased width
"small" sphere    → reduced radius
```

### Multiple Objects
```
"red box and blue sphere"
"wooden table and two chairs"
→ Creates multiple components
```

### Common Patterns
```
[COLOR] [OBJECT]
[COLOR] [OBJECT] [DIMENSION]s [POSITION]
[ACTION] [COLOR] [OBJECT]
```

---

## Response Format

```json
{
  "success": true,
  "modelType": "custom_3d_object",
  "blueprint": [
    {
      "shape": "box|sphere|cylinder|...",
      "scale": [w, h, d],
      "position": [x, y, z],
      "color": "0xRRGGBB",
      "rotation": [rx, ry, rz],
      "wireframe": false
    }
  ]
}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Too small | Increase size/radius/height |
| Too big | Decrease dimensions |
| Wrong position | Use "at X,Y,Z" format |
| Color wrong | Use color name or "0xRRGGBB" |
| Not rendering | Check object type spelling |

---

## Command Template

```
[ACTION] [COLOR] [OBJECT] [DIMENSION] [POSITION]

Examples:
"build      red     box      size 1,1,1  at 0,0,0"
"create     wooden  table    width 2     depth 1"
"make       blue    chair    size 0.6    at 1,0,0"
"generate   gray    building height 5    width 3"
```

---

## Quick Test Commands

Paste these to test the system:

```
1. build a red box

2. wooden table

3. blue chair at 1,0,0

4. gray building height 5

5. gold pyramid

6. cyan sphere radius 2

7. green cylinder height 3

8. yellow cube size 2,2,2

9. purple torus

10. brown table width 2 depth 1
```

---

## Component Counts

| Object | Components |
|--------|-----------|
| Box | 1 |
| Sphere | 1 |
| Cylinder | 1 |
| Table | 5 |
| Chair | 6 |
| Building | 11 |
| Pyramid | 4 |

---

## Performance Guide

| Objects | Typical Time |
|---------|------------|
| 1 object | < 100ms |
| 2-3 objects | < 200ms |
| 4-6 objects | < 300ms |
| 10+ objects | < 500ms |

---

## Color Preview

**Named:**
🔴 red | 🔵 blue | 🟢 green | 🟡 yellow
⚫ black | ⚪ white | 🟣 purple | 🟠 orange

**Wood Tones:**
🟤 brown | 🟫 wood | 🩶 dark_gray

**Pastels:**
🩷 pink | ⚪ light_gray | 💎 silver | ✨ gold

---

## Coordinate System

```
     Y (up)
     |
     *--- X (right)
    /
   /
  Z (back)

Center: (0, 0, 0)
Default ground: Y = 0
Object mid-point: Y = 0.5 (sitting on ground)
```

---

## API Endpoint

```
POST /api/simulate
Content-Type: application/json

{
  "prompt": "build a red box"
}
```

---

## Files Reference

| File | Purpose |
|------|---------|
| GEOMETRY_BUILDER_GUIDE.md | Full user guide |
| GEOMETRY_BUILDER_API.md | API & architecture |
| GEOMETRY_BUILDER_EXTEND.md | Extension guide |
| GEOMETRY_BUILDER_IMPLEMENTATION.md | Technical details |

---

**Start Building!** 🚀

Try: `build a red box`
