.PHONY: commit

deploy:
	npm run deploy

gp:
	@set -e; \
	branch="$$(git rev-parse --abbrev-ref HEAD)"; \
	if [ "$$branch" != "develop" ]; then \
	  echo "❌ You are on '$$branch'. Switch to 'develop' first."; \
	  exit 1; \
	fi; \
	printf "Commit message: "; \
	read -r msg; \
	if [ -z "$$msg" ]; then \
	  echo "❌ Empty commit message. Aborting."; \
	  exit 1; \
	fi; \
	git add .; \
	git commit -m "$$msg"; \
	git push origin develop; \
	echo "✅ Committed and pushed to develop: $$msg"

gpdev:
	@set -e; \
	branch="$$(git rev-parse --abbrev-ref HEAD)"; \
	if [ "$$branch" != "dev" ]; then \
	  echo "❌ You are on '$$branch'. Switch to 'dev' first."; \
	  exit 1; \
	fi; \
	printf "Commit message: "; \
	read -r msg; \
	if [ -z "$$msg" ]; then \
	  echo "❌ Empty commit message. Aborting."; \
	  exit 1; \
	fi; \
	git add .; \
	git commit -m "$$msg"; \
	git push origin dev; \
	echo "✅ Committed and pushed to dev: $$msg"