DEV_BRANCH := develop
PROD_BRANCH := master
BRANCH ?=

deploy:
	@set -e; \
	branch="$$(git rev-parse --abbrev-ref HEAD)"; \
	if [ "$$branch" != "$(PROD_BRANCH)" ]; then \
	  echo "❌ You are on '$$branch'. Switch to '$(PROD_BRANCH)' first."; \
	  exit 1; \
	fi; \
	npm test; \
	echo "Tests passed."; \
	npm run deploy; \
	git checkout $(DEV_BRANCH); \
	echo "Deploy done."

develop:
	git checkout $(DEV_BRANCH); \
	$(MAKE) gitpull BRANCH=$(DEV_BRANCH); \
	echo "✅ Now ready to develop."

check-branch:
	@if [ -z "$(BRANCH)" ]; then \
	  echo "❌ BRANCH is required. Usage: make gitpull BRANCH=<branch-name>"; \
	  exit 1; \
	fi

gitpull: check-branch
	@set -e; \
	branch="$$(git rev-parse --abbrev-ref HEAD)"; \
	if [ "$$branch" != "$(BRANCH)" ]; then \
	  echo "❌ You are on '$$branch'. Switch to '$(BRANCH)' first."; \
	  exit 1; \
	fi; \
	git pull origin $(BRANCH); \
	echo "✅ Pulled from $(BRANCH)"

gitpush: check-branch
	@set -e; \
	branch="$$(git rev-parse --abbrev-ref HEAD)"; \
	if [ "$$branch" != "$(BRANCH)" ]; then \
	  echo "❌ You are on '$$branch'. Switch to '$(BRANCH)' first."; \
	  exit 1; \
	fi; \
	git add .; \
	if git diff --cached --quiet; then \
	  echo "❗️ Nothing to commit on $(BRANCH)."; \
	  exit 0; \
	fi; \
	printf "Commit message: "; \
	read -r msg; \
	if [ -z "$$msg" ]; then \
	  echo "❌ Empty commit message. Aborting."; \
	  exit 1; \
	fi; \
	git commit -m "$$msg"; \
	git push origin $(BRANCH); \
	echo "✅ Committed and pushed to $(BRANCH): $$msg"

gitpush-current:
	@branch="$$(git rev-parse --abbrev-ref HEAD)"; \
	$(MAKE) gitpush BRANCH="$$branch"

gitmerge:
	@set -e; \
	git checkout $(DEV_BRANCH); \
	$(MAKE) gitpull BRANCH=$(DEV_BRANCH); \
	git checkout $(PROD_BRANCH); \
	git pull origin $(PROD_BRANCH); \
	if git diff --quiet $(PROD_BRANCH)..$(DEV_BRANCH); then \
	  git checkout $(DEV_BRANCH); \
	  echo "⭕️ No differences to merge. Now you're in $(DEV_BRANCH) branch"; \
	  exit 0; \
	fi; \
	git merge --no-ff --no-edit $(DEV_BRANCH); \
	git push origin $(PROD_BRANCH); \
	echo "❇️ Merged and pushed to $(PROD_BRANCH). Now ready to deploy👌👌👌."
