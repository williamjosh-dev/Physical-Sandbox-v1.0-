"""
Test script for the 3D Geometry Builder.
Demonstrates how to build custom 3D objects.
"""

from app.physics.geometry_builder import ObjectBuilder, components_to_blueprint

def test_basic_shapes():
    """Test individual shape building"""
    print("=== Testing Basic Shapes ===\n")
    
    # Test box
    box = ObjectBuilder.build_box(width=2.0, height=1.0, depth=1.0, color="red")
    print(f"Box: {box}\n")
    
    # Test sphere
    sphere = ObjectBuilder.build_sphere(radius=1.0, color="blue")
    print(f"Sphere: {sphere}\n")
    
    # Test cylinder
    cylinder = ObjectBuilder.build_cylinder(radius=0.5, height=2.0, color="green")
    print(f"Cylinder: {cylinder}\n")


def test_compound_objects():
    """Test compound object building"""
    print("\n=== Testing Compound Objects ===\n")
    
    # Test table
    table_components = ObjectBuilder.build_table(width=2.0, depth=1.0, top_color="wood", leg_color="brown")
    print(f"Table ({len(table_components)} components):")
    for comp in table_components:
        print(f"  - {comp.shape} at {comp.position} with color {comp.color}")
    
    # Convert to blueprint format
    table_blueprint = components_to_blueprint(table_components)
    print(f"\nTable Blueprint: {table_blueprint}\n")
    
    # Test chair
    chair_components = ObjectBuilder.build_chair(seat_color="blue", leg_color="brown")
    print(f"Chair ({len(chair_components)} components):")
    for comp in chair_components:
        print(f"  - {comp.shape} at {comp.position} with color {comp.color}")


def test_natural_language_parsing():
    """Test parsing natural language descriptions"""
    print("\n=== Testing Natural Language Parsing ===\n")
    
    test_prompts = [
        "build a red box",
        "create a wooden table with width 2 depth 1",
        "make a blue chair at position 1,0,0",
        "yellow sphere",
        "tall gray building with height 5",
        "gold pyramid",
    ]
    
    for prompt in test_prompts:
        print(f"Prompt: '{prompt}'")
        components = ObjectBuilder.parse_and_build(prompt)
        blueprint = components_to_blueprint(components)
        print(f"Generated {len(blueprint)} component(s):")
        for comp in blueprint:
            print(f"  - {comp['shape']} ({comp['color']}) at {comp['position']}")
        print()


if __name__ == "__main__":
    test_basic_shapes()
    test_compound_objects()
    test_natural_language_parsing()
    
    print("\n✅ All tests completed!")
