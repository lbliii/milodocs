import yaml
import jsonref
import json
import os
import sys  # Import sys to use sys.argv for command line arguments

def insert_circular_reference_stubs(obj, path=None, visited=None):
    if visited is None:
        visited = {}
    if path is None:
        path = []

    obj_id = id(obj)
    if obj_id in visited:
        # Circular reference detected; insert a stub
        return {"$ref": f"#/components/schemas/{visited[obj_id]}",
                "description": "Circular reference; see the component mentioned in $ref"}

    if isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            visited[obj_id] = k  # Track the current path/component
            new_obj[k] = insert_circular_reference_stubs(v, path + [k], visited.copy())
        return new_obj
    elif isinstance(obj, list):
        return [insert_circular_reference_stubs(item, path + [str(index)], visited.copy()) for index, item in enumerate(obj)]
    else:
        return obj

def preprocess_openapi_spec(input_file_path, output_file_path):
    # Determine the file extension
    _, file_extension = os.path.splitext(input_file_path)
    
    # Load the file based on its extension
    with open(input_file_path, 'r') as input_file:
        if file_extension.lower() in ['.yml', '.yaml']:
            spec = yaml.safe_load(input_file)
        elif file_extension.lower() == '.json':
            spec = json.load(input_file)
        else:
            raise ValueError("Unsupported file format. Please provide a .yaml, .yml, or .json file.")
    
    # Resolve $ref references
    resolved_spec = jsonref.JsonRef.replace_refs(spec)
    
    # Process to insert stubs for circular references
    processed_spec = insert_circular_reference_stubs(resolved_spec)

    # Attempt to write the processed spec to a new file
    _, output_file_extension = os.path.splitext(output_file_path)
    with open(output_file_path, 'w') as output_file:
        if output_file_extension.lower() == '.json':
            json.dump(processed_spec, output_file, indent=2)
        elif output_file_extension.lower() in ['.yml', '.yaml']:
            yaml.dump(processed_spec, output_file, allow_unicode=True, default_flow_style=False)
        else:
            raise ValueError("Unsupported output file format. Please provide a .yaml, .yml, or .json file.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_file> <output_file>")
        sys.exit(1)
    
    input_file_path = sys.argv[1]  # First argument after the script name
    output_file_path = sys.argv[2]  # Second argument
    
    preprocess_openapi_spec(input_file_path, output_file_path)
