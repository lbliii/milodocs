import sys
import os
import csv
import re

def normalize_version(version):
    """Converts version to #.#.X format, ignoring patch version."""
    major_minor = re.match(r'^(\d+\.\d+)\.\d+$', version)
    if major_minor:
        return f"{major_minor.group(1)}.X"
    return version

def main():
    if len(sys.argv) != 3:
        print("Usage: python update-supported-release-table.py <product> <version>")
        sys.exit(1)

    product = sys.argv[1]
    version = sys.argv[2].upper()  # Ensure uppercase for consistency

    version = normalize_version(version)
    if not re.match(r'^\d+\.\d+\.X$', version, re.IGNORECASE):
        print("Version must be in the format #.#.X after normalization.")
        sys.exit(1)

    valid_products = ['genai', 'mldm', 'mlde', 'mldes', 'mlis']
    if product not in valid_products:
        print(f"Product must be one of: {', '.join(valid_products)}")
        sys.exit(1)

    supported_releases_file = os.path.join('static', 'csv', f'supported-releases-{product}.csv')
    if not os.path.exists(supported_releases_file):
        print("File not found: " + supported_releases_file)
        sys.exit(1)

    with open(supported_releases_file, 'r') as f:
        reader = csv.reader(f)
        rows = list(reader)

    # Check if the normalized version already exists
    for row in rows:
        if row[0].strip().upper() == version:
            print(f"{version} is already on the support table.")
            sys.exit(0)

    # Update the last SUPPORT=YES row to SUPPORT=NO
    for row in reversed(rows[1:]):  # Skip header
        if row[2].strip().upper() == 'YES':
            row[2] = 'NO'
            break

    # Insert the new version row after the header
    new_row = [version, 'GA', 'YES']
    rows.insert(1, new_row)

    with open(supported_releases_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)

    print(f"Updated {supported_releases_file} with version {version}")

if __name__ == '__main__':
    main()
