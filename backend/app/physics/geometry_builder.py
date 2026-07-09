"""
3D Geometry Builder - Constructs complex 3D objects from simple component descriptions.
Provides a consistent formula for LLM to generate arbitrary 3D geometry.
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Tuple
import re

@dataclass
class GeometryComponent:
    """Represents a single geometric component"""
    shape: str  # "box", "sphere", "cylinder", "cone", "torus"
    scale: Tuple[float, float, float]
    position: Tuple[float, float, float]
    color: str  # hex format "0xRRGGBB"
    rotation: Tuple[float, float, float] = (0.0, 0.0, 0.0)  # Euler angles in radians
    wireframe: bool = False


class ObjectBuilder:
    """Builds complex 3D objects from descriptions using basic primitives."""
    
    # Common color palette
    COLORS = {
        "red": "0xff0000",
        "blue": "0x0000ff",
        "green": "0x00ff00",
        "yellow": "0xffff00",
        "white": "0xffffff",
        "black": "0x000000",
        "gray": "0x808080",
        "cyan": "0x00ffff",
        "magenta": "0xff00ff",
        "orange": "0xffa500",
        "purple": "0x800080",
        "brown": "0xa52a2a",
        "pink": "0xffc0cb",
        "gold": "0xffd700",
        "silver": "0xc0c0c0",
        "wood": "0x8b4513",
        "dark_gray": "0x404040",
        "light_gray": "0xc0c0c0",
    }
    
    @staticmethod
    def hex_color(color_name: str) -> str:
        """Convert color name to hex format"""
        color_name = color_name.lower().strip()
        if color_name.startswith("0x"):
            return color_name
        return ObjectBuilder.COLORS.get(color_name, "0xcccccc")
    
    @staticmethod
    def build_box(width: float = 1.0, height: float = 1.0, depth: float = 1.0, 
                  position: Tuple[float, float, float] = (0.0, 0.5, 0.0),
                  color: str = "0x3b82f6", rotation: Tuple[float, float, float] = (0.0, 0.0, 0.0)) -> GeometryComponent:
        """Build a simple box"""
        return GeometryComponent(
            shape="box",
            scale=(width, height, depth),
            position=position,
            color=ObjectBuilder.hex_color(color),
            rotation=rotation
        )
    
    @staticmethod
    def build_sphere(radius: float = 0.5,
                    position: Tuple[float, float, float] = (0.0, 0.5, 0.0),
                    color: str = "0xef4444") -> GeometryComponent:
        """Build a simple sphere"""
        return GeometryComponent(
            shape="sphere",
            scale=(radius, radius, radius),
            position=position,
            color=ObjectBuilder.hex_color(color)
        )
    
    @staticmethod
    def build_cylinder(radius: float = 0.5, height: float = 1.0,
                      position: Tuple[float, float, float] = (0.0, 0.5, 0.0),
                      color: str = "0x22c55e",
                      rotation: Tuple[float, float, float] = (0.0, 0.0, 0.0)) -> GeometryComponent:
        """Build a simple cylinder"""
        return GeometryComponent(
            shape="cylinder",
            scale=(radius, height, radius),
            position=position,
            color=ObjectBuilder.hex_color(color),
            rotation=rotation
        )
    
    @staticmethod
    def build_table(width: float = 2.0, depth: float = 1.0, height: float = 0.75,
                   leg_height: float = 0.7, leg_width: float = 0.1,
                   position: Tuple[float, float, float] = (0.0, 0.0, 0.0),
                   top_color: str = "wood", leg_color: str = "brown") -> List[GeometryComponent]:
        """Build a table with 4 legs"""
        components = []
        
        # Table top (thin box)
        components.append(GeometryComponent(
            shape="box",
            scale=(width, 0.05, depth),
            position=(position[0], position[1] + leg_height, position[2]),
            color=ObjectBuilder.hex_color(top_color)
        ))
        
        # Legs
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
    
    @staticmethod
    def build_chair(seat_width: float = 0.6, seat_depth: float = 0.6, seat_height: float = 0.4,
                   back_height: float = 0.8, position: Tuple[float, float, float] = (0.0, 0.0, 0.0),
                   seat_color: str = "blue", leg_color: str = "brown") -> List[GeometryComponent]:
        """Build a chair with seat, back, and 4 legs"""
        components = []
        
        # Seat (horizontal box)
        components.append(GeometryComponent(
            shape="box",
            scale=(seat_width, 0.05, seat_depth),
            position=(position[0], position[1] + seat_height, position[2]),
            color=ObjectBuilder.hex_color(seat_color)
        ))
        
        # Back rest
        components.append(GeometryComponent(
            shape="box",
            scale=(seat_width, back_height - 0.1, 0.05),
            position=(position[0], position[1] + seat_height + (back_height - 0.1) / 2, position[2] + seat_depth/2),
            color=ObjectBuilder.hex_color(seat_color)
        ))
        
        # Legs
        leg_height = seat_height - 0.05
        leg_width = 0.05
        
        leg_positions = [
            (position[0] - seat_width/3, position[1] + leg_height/2, position[2] - seat_depth/3),
            (position[0] + seat_width/3, position[1] + leg_height/2, position[2] - seat_depth/3),
            (position[0] - seat_width/3, position[1] + leg_height/2, position[2] + seat_depth/3),
            (position[0] + seat_width/3, position[1] + leg_height/2, position[2] + seat_depth/3),
        ]
        
        for leg_pos in leg_positions:
            components.append(GeometryComponent(
                shape="box",
                scale=(leg_width, leg_height, leg_width),
                position=leg_pos,
                color=ObjectBuilder.hex_color(leg_color)
            ))
        
        return components
    
    @staticmethod
    def build_building(width: float = 1.0, depth: float = 1.0, height: float = 3.0,
                      position: Tuple[float, float, float] = (0.0, 0.0, 0.0),
                      color: str = "gray", window_color: str = "cyan") -> List[GeometryComponent]:
        """Build a multi-story building"""
        components = []
        
        # Main building box
        components.append(GeometryComponent(
            shape="box",
            scale=(width, height, depth),
            position=(position[0], position[1] + height/2, position[2]),
            color=ObjectBuilder.hex_color(color)
        ))
        
        # Windows (3x3 grid)
        window_size = 0.15
        for floor in range(3):
            for col in range(3):
                x = position[0] - width/3 + col * width/3
                y = position[1] + height - 0.5 - floor * 0.8
                z = position[2] + depth/2
                
                components.append(GeometryComponent(
                    shape="box",
                    scale=(window_size, window_size, 0.02),
                    position=(x, y, z),
                    color=ObjectBuilder.hex_color(window_color)
                ))
        
        # Roof (cone)
        components.append(GeometryComponent(
            shape="cone",
            scale=(width * 0.6, 0.5, depth * 0.6),
            position=(position[0], position[1] + height, position[2]),
            color=ObjectBuilder.hex_color("orange")
        ))
        
        return components
    
    @staticmethod
    def build_pyramid(base_width: float = 1.0, height: float = 1.0,
                     position: Tuple[float, float, float] = (0.0, 0.5, 0.0),
                     color: str = "gold") -> List[GeometryComponent]:
        """Build a pyramid using boxes"""
        components = []
        
        layers = 4
        for i in range(layers):
            layer_width = base_width * (1 - i / layers)
            layer_height = height / layers * 0.9
            y = position[1] + i * height / layers + layer_height / 2
            
            components.append(GeometryComponent(
                shape="box",
                scale=(layer_width, layer_height, layer_width),
                position=(position[0], y, position[2]),
                color=ObjectBuilder.hex_color(color) if i % 2 == 0 else ObjectBuilder.hex_color("orange")
            ))
        
        return components
    
    @staticmethod
    def parse_and_build(description: str) -> List[GeometryComponent]:
        """
        Parse a natural language description and build the geometry.
        This is the main entry point for LLM-generated descriptions.
        
        Examples:
        - "red box at 0,0,0 size 1,1,1"
        - "wooden table width 2 depth 1"
        - "blue chair at position 1,0,0"
        - "building height 5 width 2"
        - "pyramid gold at 0,0,0"
        """
        description = description.lower().strip()
        components = []
        
        # Extract color
        color = "0xcccccc"
        for color_name, hex_val in ObjectBuilder.COLORS.items():
            if color_name.replace("_", " ") in description:
                color = hex_val
                break
        
        # Extract position: "at X,Y,Z" or "position X,Y,Z"
        position = (0.0, 0.0, 0.0)
        pos_match = re.search(r'(?:at|position)\s+([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)', description)
        if pos_match:
            position = (float(pos_match.group(1)), float(pos_match.group(2)), float(pos_match.group(3)))
        
        # Extract scale: "size X,Y,Z"
        scale = None
        scale_match = re.search(r'size\s+([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)', description)
        if scale_match:
            scale = (float(scale_match.group(1)), float(scale_match.group(2)), float(scale_match.group(3)))
        
        # Pattern matching for specific objects
        if re.search(r'\btable\b', description):
            width = float(re.search(r'width\s+([\d.]+)', description).group(1)) if re.search(r'width\s+([\d.]+)', description) else 2.0
            depth = float(re.search(r'depth\s+([\d.]+)', description).group(1)) if re.search(r'depth\s+([\d.]+)', description) else 1.0
            components = ObjectBuilder.build_table(width=width, depth=depth, position=position, top_color=color)
        
        elif re.search(r'\bchair\b', description):
            components = ObjectBuilder.build_chair(position=position, seat_color=color)
        
        elif re.search(r'\b(?:building|house|skyscraper)\b', description):
            height = float(re.search(r'height\s+([\d.]+)', description).group(1)) if re.search(r'height\s+([\d.]+)', description) else 3.0
            components = ObjectBuilder.build_building(height=height, position=position, color=color)
        
        elif re.search(r'\b(?:pyramid|cone|triangle)\b', description):
            components = ObjectBuilder.build_pyramid(position=position, color=color)
        
        elif re.search(r'\b(?:box|cube|block)\b', description):
            if scale:
                components.append(ObjectBuilder.build_box(scale[0], scale[1], scale[2], position=position, color=color))
            else:
                width = float(re.search(r'width\s+([\d.]+)', description).group(1)) if re.search(r'width\s+([\d.]+)', description) else 1.0
                height = float(re.search(r'height\s+([\d.]+)', description).group(1)) if re.search(r'height\s+([\d.]+)', description) else 1.0
                depth = float(re.search(r'depth\s+([\d.]+)', description).group(1)) if re.search(r'depth\s+([\d.]+)', description) else 1.0
                components.append(ObjectBuilder.build_box(width, height, depth, position=position, color=color))
        
        elif re.search(r'\b(?:sphere|ball|orb)\b', description):
            radius = float(re.search(r'radius\s+([\d.]+)', description).group(1)) if re.search(r'radius\s+([\d.]+)', description) else 0.5
            components.append(ObjectBuilder.build_sphere(radius=radius, position=position, color=color))
        
        elif re.search(r'\b(?:cylinder|pillar|column|tube)\b', description):
            radius = float(re.search(r'radius\s+([\d.]+)', description).group(1)) if re.search(r'radius\s+([\d.]+)', description) else 0.5
            height = float(re.search(r'height\s+([\d.]+)', description).group(1)) if re.search(r'height\s+([\d.]+)', description) else 1.0
            components.append(ObjectBuilder.build_cylinder(radius=radius, height=height, position=position, color=color))
        
        else:
            # Default: treat as generic box
            components.append(ObjectBuilder.build_box(position=position, color=color))
        
        return components


def components_to_blueprint(components: List[GeometryComponent]) -> List[Dict[str, Any]]:
    """Convert GeometryComponent list to blueprint format for frontend"""
    blueprint = []
    for comp in components:
        blueprint.append({
            "shape": comp.shape,
            "scale": comp.scale,
            "position": comp.position,
            "color": comp.color,
            "rotation": comp.rotation,
            "wireframe": comp.wireframe,
        })
    return blueprint
