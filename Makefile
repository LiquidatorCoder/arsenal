.PHONY: get test analyze update-goldens verify-goldens install-hooks

get:  ## Fetch dependencies for the package and the example app
	@flutter pub get
	@cd example && flutter pub get

test:  ## Run all widget + golden tests
	@flutter test

analyze:  ## Static analysis
	@flutter analyze

update-goldens:  ## Regenerate goldens only for changed components
	@./tool/update_goldens.sh

verify-goldens:  ## Fail if goldens don't match current renders
	@flutter test

install-hooks:  ## Install git pre-commit hook (run once after cloning)
	@cp tool/pre_commit_goldens.sh .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "Git pre-commit hook installed."
