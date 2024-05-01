# Makefile to start the Hugo server with specific product versions

%: 
	@echo "Starting Hugo server for HPE $@ Docs"
	hugo server --environment $@

# Default action if no product is specified
docs all:
	@echo "Starting Hugo server for all docs"
	@hugo server

# Target for generating the OpenAPI spec for the API reference

api-gen:
	python tools/spec-preprocessor.py $(INPUT) $(OUTPUT)

api-gen-test:
	python tools/spec-preprocessor.py data/basicApi.yaml data/basicApi-output.json 

# Target for building the site for offline use with drafts
offline-drafts:
	@echo "Building Hugo site for offline use with drafts"
	@hugo -D --environment development --config config/hugo-offline.yaml --minify
	@tar -czvf offline-docs.tar.gz ./public
	@echo "Site packaged into offline-docs.tar.gz (including drafts)"

# Target for building the site for offline use without drafts

offline:
	@echo "Building Hugo site for offline use"
	@hugo --environment development --config config/hugo-offline.yaml --minify
	@tar -czvf offline-docs.tar.gz ./public
	@echo "Site packaged into offline-docs.tar.gz"

# Target for updating the release frontmatter for a given product vdir; also updates the supported release table csv
## # Usage: make update-frontmatter P=<product_name> VDIR=<version_dir> V=<new_version_number>
v-bump:
	@python tools/update-prod-release-frontmatter.py $(P) $(VDIR) $(V)
	@python tools/update-supported-release-table.py $(P) $(V)