import sys
import os
import re
import yaml

def load_frontmatter_and_content(file_content):
    """Extracts the frontmatter and the markdown content from the provided file content."""
    parts = file_content.split('---', 2)
    if len(parts) < 3:
        raise ValueError("Frontmatter not found.")
    frontmatter_yaml, content = parts[1], parts[2]
    return yaml.safe_load(frontmatter_yaml), content

def update_frontmatter(frontmatter, major, minor, patch):
    """Updates the 'cascade' part of the frontmatter without altering other parts."""
    if 'cascade' in frontmatter:
        cascade = frontmatter['cascade']
        cascade['major'] = major
        cascade['minor'] = minor
        cascade['patch'] = patch
        cascade['latest'] = True
    else:
        print("Frontmatter does not contain a 'cascade' section.")
        sys.exit(1)
    return frontmatter

def main():
    if len(sys.argv) != 4:
        print("Usage: python update-prod-release-frontmatter.py <product> <version_dir> <new_version>")
        sys.exit(1)

    product, version_dir, new_version = sys.argv[1:4]

    if not re.match(r'^\d+\.\d+\.\d+$', new_version, re.IGNORECASE):
        print("New version must be in the format #.#.#")
        sys.exit(1)

    valid_products = ['genai', 'mldm', 'mlde', 'mldes', 'mlis']
    if product not in valid_products:
        print(f"Product must be one of: {', '.join(valid_products)}")
        sys.exit(1)

    index_file = os.path.join('content', 'products', product, version_dir, '_index.md')
    if not os.path.exists(index_file):
        print(f"File not found: {index_file}")
        sys.exit(1)

    with open(index_file, 'r') as f:
        file_content = f.read()

    try:
        frontmatter, content = load_frontmatter_and_content(file_content)
    except ValueError as error:
        print(error)
        sys.exit(1)

    major, minor, patch = map(int, new_version.split('.'))
    updated_frontmatter = update_frontmatter(frontmatter, major, minor, patch)
    updated_content = '---\n' + yaml.dump(updated_frontmatter, sort_keys=False) + '---' + content

    with open(index_file, 'w') as f:
        f.write(updated_content)

    print(f"Updated {index_file} with version {new_version}")

if __name__ == '__main__':
    main()
