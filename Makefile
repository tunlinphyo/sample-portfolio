.PHONY: commit deploy

DEV_BRANCH := develop

deploy:
	@set -e; \
	branch="$$(git rev-parse --abbrev-ref HEAD)"; \
	if [ "$$branch" != "$(DEV_BRANCH)" ]; then \
	  echo "❌ You are on '$$branch'. Switch to '$(DEV_BRANCH)' first."; \
	  exit 1; \
	fi; \
	npm test; \
	echo "Tests passed."; \
	npm run deploy; \
	echo "Deploy done."

gpl:
	@set -e; \
	branch="$$(git rev-parse --abbrev-ref HEAD)"; \
	if [ "$$branch" != "$(DEV_BRANCH)" ]; then \
	  echo "❌ You are on '$$branch'. Switch to '$(DEV_BRANCH)' first."; \
	  exit 1; \
	fi; \
	git pull origin $(DEV_BRANCH);
	echo "✅ Pulled from $(DEV_BRANCH)"

gp:
	@set -e; \
	branch="$$(git rev-parse --abbrev-ref HEAD)"; \
	if [ "$$branch" != "$(DEV_BRANCH)" ]; then \
	  echo "❌ You are on '$$branch'. Switch to '$(DEV_BRANCH)' first."; \
	  exit 1; \
	fi; \
	git add .; \
  if git diff --cached --quiet; then \
    echo "ℹ️ Nothing to commit on $(DEV_BRANCH)."; \
    exit 0; \
  fi; \
	printf "Commit message: "; \
	read -r msg; \
	if [ -z "$$msg" ]; then \
	  echo "❌ Empty commit message. Aborting."; \
	  exit 1; \
	fi; \
	git add .; \
	git commit -m "$$msg"; \
	git push origin $(DEV_BRANCH); \
	echo "✅ Committed and pushed to $(DEV_BRANCH): $$msg"
