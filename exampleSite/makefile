# Makefile for Hugo theme development and variant testing

# Default development server (default theme variant)
dev default:
	@echo "Starting Hugo development server (default variant)"
	@hugo server --themesDir ../..

# Development with debug mode enabled
dev-debug:
	@echo "Starting Hugo development server with debug mode"
	@hugo server -D --themesDir ../..

# Theme Variant Development Servers
dev-nvidia:
	@echo "Starting Hugo development server (NVIDIA variant)"
	@hugo server --configDir config --environment nvidia --themesDir ../..

dev-opensource:
	@echo "Starting Hugo development server (Open Source variant)"  
	@hugo server --configDir config --environment open-source --themesDir ../..

dev-enterprise:
	@echo "Starting Hugo development server (Enterprise variant)"
	@hugo server --configDir config --environment enterprise --themesDir ../..

# Development server with custom themes directory (for external theme testing)
dev-external:
	@echo "Starting Hugo development server (external theme mode)"
	@hugo server

# Production builds for different variants
build-nvidia:
	@echo "Building NVIDIA variant for production"
	@hugo --configDir config --environment nvidia --themesDir ../.. --minify

build-opensource:
	@echo "Building Open Source variant for production"
	@hugo --configDir config --environment open-source --themesDir ../.. --minify

build-enterprise:
	@echo "Building Enterprise variant for production"
	@hugo --configDir config --environment enterprise --themesDir ../.. --minify

build-default:
	@echo "Building default variant for production"
	@hugo --environment production --themesDir ../.. --minify

# Target for generating the OpenAPI spec for the API reference

api-gen:
	python tools/spec-preprocessor.py $(INPUT) $(OUTPUT)

api-gen-test:
	python tools/spec-preprocessor.py data/basicApi.yaml data/basicApi-output.json 

# Offline builds
offline-drafts:
	@echo "Building Hugo site for offline use with drafts"
	@hugo -D --configDir config --environment offline --themesDir ../.. --minify
	@tar -czvf offline-docs.tar.gz ./public
	@echo "Site packaged into offline-docs.tar.gz (including drafts)"

offline:
	@echo "Building Hugo site for offline use"
	@hugo --configDir config --environment offline --themesDir ../.. --minify
	@tar -czvf offline-docs.tar.gz ./public
	@echo "Site packaged into offline-docs.tar.gz"

# Debug and testing commands
debug-info:
	@echo "Checking Hugo version and module information"
	@hugo version
	@hugo mod graph

test-all-variants:
	@echo "Testing all theme variants..."
	@echo "Testing default variant..."
	@hugo --configDir config --themesDir ../.. --quiet || echo "❌ Default variant failed"
	@echo "Testing NVIDIA variant..."
	@hugo --configDir config --environment nvidia --themesDir ../.. --quiet || echo "❌ NVIDIA variant failed"
	@echo "Testing Open Source variant..."
	@hugo --configDir config --environment open-source --themesDir ../.. --quiet || echo "❌ Open Source variant failed"
	@echo "Testing Enterprise variant..."
	@hugo --configDir config --environment enterprise --themesDir ../.. --quiet || echo "❌ Enterprise variant failed"
	@echo "✅ All variants tested"

# Help command
help:
	@echo "Hugo Theme Development Commands:"
	@echo ""
	@echo "Development Servers (Theme Development):"
	@echo "  make dev              - Start default variant development server"
	@echo "  make dev-debug        - Start development server with debug mode"
	@echo "  make dev-nvidia       - Start NVIDIA variant development server"
	@echo "  make dev-opensource   - Start Open Source variant development server"
	@echo "  make dev-enterprise   - Start Enterprise variant development server"
	@echo "  make dev-external     - Start server for external theme testing"
	@echo ""
	@echo "Note: Dev commands use --themesDir ../.. for nested theme development"
	@echo ""
	@echo "Production Builds:"
	@echo "  make build-default    - Build default variant for production"
	@echo "  make build-nvidia     - Build NVIDIA variant for production"
	@echo "  make build-opensource - Build Open Source variant for production"
	@echo "  make build-enterprise - Build Enterprise variant for production"
	@echo ""
	@echo "Offline Builds:"
	@echo "  make offline         - Build offline version (no drafts)"
	@echo "  make offline-drafts  - Build offline version (with drafts)"
	@echo ""
	@echo "Testing & Debug:"
	@echo "  make debug-info      - Show Hugo version and module info"
	@echo "  make test-all-variants - Test build all theme variants"
	@echo ""
	@echo "API Tools:"
	@echo "  make api-gen INPUT=file.yaml OUTPUT=file.json - Generate API spec"
	@echo "  make api-gen-test    - Test API generation"
	@echo ""
	@echo "Version Management:"
	@echo "  make v-bump P=product VDIR=version V=number - Update version frontmatter"

# Target for updating the release frontmatter for a given product vdir; also updates the supported release table csv
## # Usage: make update-frontmatter P=<product_name> VDIR=<version_dir> V=<new_version_number>
v-bump:
	@python tools/update-prod-release-frontmatter.py $(P) $(VDIR) $(V)
	@python tools/update-supported-release-table.py $(P) $(V)