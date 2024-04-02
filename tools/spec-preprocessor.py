import yaml
import jsonref
import json

def preprocess_openapi_spec(input_file_path, output_file_path):
    # Load the YAML file
    with open(input_file_path, 'r') as input_file:
        spec = yaml.safe_load(input_file)
    
    # Resolve $ref references
    resolved_spec = jsonref.JsonRef.replace_refs(spec)

    # Write the resolved spec to a new JSON file
    with open(output_file_path, 'w') as output_file:
        json.dump(resolved_spec, output_file, indent=2)

if __name__ == "__main__":
    # Specify your input OpenAPI YAML and output JSON file paths
    input_file_path = 'data/basicApi.yaml'
    output_file_path = 'data/basicApi-output.json'
    
    preprocess_openapi_spec(input_file_path, output_file_path)
