# Extending the Geometry Builder

This guide shows how to add new objects and customize the builder for your needs.

## Adding New Object Types

### Step 1: Add a Builder Method

In `backend/app/physics/geometry_builder.py`, add a new static method:

```python
@staticmethod
def build_desk(width: float = 1.5, depth: float = 0.75, height: float = 0.75,
              leg_height: float = 0.7, leg_width: float = 0.08,
              position: Tuple[float, float, float] = (0.0, 0.0, 0.0),
              top_color: str = "wood", leg_color: str = "brown",
              drawer_color: str = "dark_gray") -> List[GeometryComponent]:
    """Build a desk with drawers"""
    components = []
    
    # Desktop (thin box)
    components.append(GeometryComponent(
        shape="box",
        scale=(width, 0.05, depth),
        position=(position[0], position[1] + leg_height, position[2]),
        color=ObjectBuilder.hex_color(top_color)
    ))
    
    # Left drawer
    components.append(GeometryComponent(
        shape="box",
        scale=(width/2 - 0.05, 0.15, depth),
        position=(position[0] - width/4, position[1] + leg_height - 0.2, position[2]),
        color=ObjectBuilder.hex_color(drawer_color)
    ))
    
    # Right drawer
    components.append(GeometryComponent(
        shape="box",
        scale=(width/2 - 0.05, 0.15, depth),
        position=(position[0] + width/4, position[1] + leg_height - 0.2, position[2]),
        color=ObjectBuilder.hex_color(drawer_color)
    ))
    
    # Legs (4x)
    leg_positions = [
        (position[0] - width/2 + leg_width/2, position[1] + leg_height/2, position[2] - depth/2 + leg_width/2),
        (position[0] + width/2 - leg_width/2, position[1] + leg_height/2, position[2] - depth/2 + leg_width/2),
        (position[0] - width/2 + leg_width/2, position[1] + leg_height/2, position[2] + depth/2 - leg_width/2),
        (position[0] + width/2 - leg_width/2, position[1] + leg_height/2, position[2] + depth/2 - leg_width/2),
    ]
    
    for leg_pos in leg_positions:
        components.append(GeometryComponent(
            shape="box",
            scale=(leg_width, leg_height, leg_width),
            position=leg_pos,
            color=ObjectBuilder.hex_color(leg_color)
        ))
    
    return components
```

### Step 2: Add Recognition Pattern

In the `parse_and_build` method, add a new pattern:

```python
elif re.search(r'\b(?:desk|workdesk|workspace)\b', description):
    width = float(re.search(r'width\s+([\d.]+)', description).group(1)) if re.search(r'width\s+([\d.]+)', description) else 1.5
    depth = float(re.search(r'depth\s+([\d.]+)', description).group(1)) if re.search(r'depth\s+([\d.]+)', description) else 0.75
    components = ObjectBuilder.build_desk(width=width, depth=depth, position=position, top_color=color)
```

### Step 3: Test Your New Object

```python
# In test_geometry_builder.py or new test file
from app.physics.geometry_builder import ObjectBuilder, components_to_blueprint

# Test the new object
desk_components = ObjectBuilder.build_desk(width=1.5, depth=0.75, top_color="wood")
print(f"Desk generated with {len(desk_components)} components:")
for comp in desk_components:
    print(f"  - {comp.shape} at {comp.position}")

# Test natural language parsing
desk = ObjectBuilder.parse_and_build("wooden desk at 0,0,0")
blueprint = components_to_blueprint(desk)
print(f"\nBlueprint: {blueprint}")
```

---

## Creating Custom Geometries

### Example: Sofa

```python
@staticmethod
def build_sofa(width: float = 2.0, depth: float = 0.8, height: float = 0.9,
              position: Tuple[float, float, float] = (0.0, 0.0, 0.0),
              color: str = "gray") -> List[GeometryComponent]:
    """Build a sofa with armrests"""
    components = []
    
    # Main seat/back
    components.append(GeometryComponent(
        shape="box",
        scale=(width, height, depth),
        position=(position[0], position[1] + height/2, position[2]),
        color=ObjectBuilder.hex_color(color)
    ))
    
    # Left armrest
    components.append(GeometryComponent(
        shape="box",
        scale=(0.2, height * 0.9, depth),
        position=(position[0] - width/2, position[1] + height * 0.45, position[2]),
        color=ObjectBuilder.hex_color(color)
    ))
    
    # Right armrest
    components.append(GeometryComponent(
        shape="box",
        scale=(0.2, height * 0.9, depth),
        position=(position[0] + width/2, position[1] + height * 0.45, position[2]),
        color=ObjectBuilder.hex_color(color)
    ))
    
    return components
```

---

## Modifying Existing Objects

### Customize Table with Shelves

```python
@staticmethod
def build_shelf_table(width: float = 1.5, depth: float = 0.5, height: float = 1.5,
                     shelves: int = 3,
                     position: Tuple[float, float, float] = (0.0, 0.0, 0.0),
                     color: str = "wood") -> List[GeometryComponent]:
    """Build a table with shelves"""
    components = []
    
    # Vertical supports
    support_width = 0.1
    for x_offset in [-width/2, width/2]:
        components.append(GeometryComponent(
            shape="box",
            scale=(support_width, height, support_width),
            position=(position[0] + x_offset, position[1] + height/2, position[2]),
            color=ObjectBuilder.hex_color(color)
        ))
    
    # Shelves
    shelf_height = height / (shelves + 1)
    for i in range(1, shelves + 1):
        y_pos = position[1] + i * shelf_height
        components.append(GeometryComponent(
            shape="box",
            scale=(width - 0.1, 0.02, depth),
            position=(position[0], y_pos, position[2]),
            color=ObjectBuilder.hex_color(color)
        ))
    
    return components
```

---

## Advanced: Parametric Objects

### Dynamic Shape Generator

```python
class ParametricObjectBuilder:
    """Generate objects with custom parameters"""
    
    @staticmethod
    def build_grid(width: int = 3, height: int = 3, spacing: float = 1.0,
                  box_size: float = 0.3, color: str = "blue") -> List[GeometryComponent]:
        """Create a grid of boxes"""
        components = []
        for i in range(width):
            for j in range(height):
                x = (i - width/2) * spacing
                y = 0.5
                z = (j - height/2) * spacing
                
                components.append(GeometryComponent(
                    shape="box",
                    scale=(box_size, box_size, box_size),
                    position=(x, y, z),
                    color=ObjectBuilder.hex_color(color)
                ))
        return components
    
    @staticmethod
    def build_tower(num_blocks: int = 5, block_size: float = 1.0,
                   colors: list = None) -> List[GeometryComponent]:
        """Create a stacked tower"""
        if colors is None:
            colors = ["red", "blue", "green", "yellow", "purple"]
        
        components = []
        for i in range(num_blocks):
            y_pos = i * block_size + block_size/2
            color = colors[i % len(colors)]
            
            components.append(GeometryComponent(
                shape="box",
                scale=(block_size, block_size, block_size),
                position=(0.0, y_pos, 0.0),
                color=ObjectBuilder.hex_color(color)
            ))
        return components
```

---

## Integration with Natural Language

### Update Detection Patterns

In `parse_and_build`:

```python
# Add to pattern matching
elif re.search(r'\b(?:grid|array)\b', description):
    width = int(re.search(r'width\s+(\d+)', description).group(1)) if re.search(r'width\s+(\d+)', description) else 3
    height = int(re.search(r'height\s+(\d+)', description).group(1)) if re.search(r'height\s+(\d+)', description) else 3
    spacing = float(re.search(r'spacing\s+([\d.]+)', description).group(1)) if re.search(r'spacing\s+([\d.]+)', description) else 1.0
    components = ParametricObjectBuilder.build_grid(width=width, height=height, spacing=spacing, color=color)

elif re.search(r'\b(?:tower|stack)\b', description):
    num_blocks = int(re.search(r'blocks?\s+(\d+)', description).group(1)) if re.search(r'blocks?\s+(\d+)', description) else 5
    components = ParametricObjectBuilder.build_tower(num_blocks=num_blocks)
```

---

## Testing Your Extensions

```python
# test_new_objects.py
from app.physics.geometry_builder import ObjectBuilder, ParametricObjectBuilder, components_to_blueprint

def test_new_objects():
    print("Testing Desk...")
    desk = ObjectBuilder.build_desk()
    print(f"✓ Desk with {len(desk)} components\n")
    
    print("Testing Grid...")
    grid = ParametricObjectBuilder.build_grid(width=3, height=3)
    print(f"✓ Grid with {len(grid)} components\n")
    
    print("Testing Tower...")
    tower = ParametricObjectBuilder.build_tower(num_blocks=5)
    print(f"✓ Tower with {len(tower)} components\n")
    
    print("Testing NL Parsing...")
    parsed_desk = ObjectBuilder.parse_and_build("wooden desk width 1.5")
    blueprint = components_to_blueprint(parsed_desk)
    print(f"✓ Parsed desk blueprint: {len(blueprint)} components\n")

if __name__ == "__main__":
    test_new_objects()
    print("✅ All extension tests passed!")
```

---

## Publishing Custom Objects

### Create an Extension Module

```python
# app/physics/custom_objects.py

from typing import List, Tuple, Dict, Any
from geometry_builder import GeometryComponent, ObjectBuilder

class IndustrialObjects:
    """Industrial/factory object library"""
    
    @staticmethod
    def build_conveyor_belt(length: float = 5.0, width: float = 0.5,
                           position: Tuple[float, float, float] = (0, 0, 0),
                           color: str = "gray") -> List[GeometryComponent]:
        """Build a conveyor belt"""
        components = []
        # Implementation...
        return components
    
    @staticmethod
    def build_robotic_arm(segments: int = 3, reach: float = 2.0) -> List[GeometryComponent]:
        """Build a multi-segment robotic arm"""
        components = []
        # Implementation...
        return components

class FurnitureLibrary:
    """Furniture object library"""
    
    @staticmethod
    def build_bed(width: float = 1.5, length: float = 2.0) -> List[GeometryComponent]:
        """Build a bed frame with mattress"""
        # Implementation...
        pass
    
    @staticmethod
    def build_cabinet(width: float = 1.0, height: float = 1.8) -> List[GeometryComponent]:
        """Build a cabinet with doors"""
        # Implementation...
        pass
```

---

## Performance Tips

1. **Reuse Components** - Don't create new geometry for repeated elements
2. **Batch Operations** - Create multiple objects in one call
3. **Optimize Positioning** - Use list comprehensions for many similar components
4. **Cache Colors** - Use pre-defined color constants

### Example Optimization

```python
# Before (slow)
for i in range(100):
    color = ObjectBuilder.hex_color(color_name)  # Called 100 times
    components.append(GeometryComponent(..., color=color))

# After (fast)
color_hex = ObjectBuilder.hex_color(color_name)  # Called once
for i in range(100):
    components.append(GeometryComponent(..., color=color_hex))
```

---

## Documentation Template

When adding new objects, include:

```python
@staticmethod
def build_my_object(param1: float = 1.0, param2: str = "red") -> List[GeometryComponent]:
    """
    Build a custom object.
    
    Args:
        param1: First parameter (unit)
        param2: Color name or hex
    
    Returns:
        List of GeometryComponents
    
    Example:
        >>> components = ObjectBuilder.build_my_object(param1=2.0, param2="blue")
        >>> blueprint = components_to_blueprint(components)
    """
    components = []
    # Implementation...
    return components
```

---

**Happy extending!** 🎨

For more help, check the main [GEOMETRY_BUILDER_GUIDE.md](./GEOMETRY_BUILDER_GUIDE.md) and [GEOMETRY_BUILDER_API.md](./GEOMETRY_BUILDER_API.md).
