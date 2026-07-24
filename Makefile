.PHONY: dev build test typecheck deploy clean

DEPLOY_DIR := .deploy-worktree
DEPLOY_BRANCH := gh-pages
DEPLOY_URL := https://ivankovic.github.io/language-learning/

dev:
	bun run dev

build:
	bun run build

test:
	bun run test

typecheck:
	bun run typecheck

# Manual deploy to GitHub Pages: builds dist/, syncs it into the
# gh-pages branch (removing stale hashed assets from the previous build
# first, since Vite renames them on every change), commits only if
# something actually changed, and pushes. Requires GitHub Pages enabled
# on this repo (Settings -> Pages -> Source: gh-pages branch).
deploy: build
	rm -rf $(DEPLOY_DIR)
	if git show-ref --verify --quiet refs/heads/$(DEPLOY_BRANCH); then \
		git worktree add $(DEPLOY_DIR) $(DEPLOY_BRANCH); \
	elif git show-ref --verify --quiet refs/remotes/origin/$(DEPLOY_BRANCH); then \
		git worktree add -b $(DEPLOY_BRANCH) $(DEPLOY_DIR) origin/$(DEPLOY_BRANCH); \
	else \
		git worktree add --orphan -b $(DEPLOY_BRANCH) $(DEPLOY_DIR); \
	fi
	find $(DEPLOY_DIR) -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
	cp -r dist/. $(DEPLOY_DIR)/
	cd $(DEPLOY_DIR) && git add -A
	cd $(DEPLOY_DIR) && git diff --cached --quiet && echo "Nothing changed, nothing to deploy." || \
		(git commit -m "Deploy $$(date -u +%Y-%m-%dT%H:%M:%SZ)" && git push origin $(DEPLOY_BRANCH))
	git worktree remove $(DEPLOY_DIR) --force
	rm -rf dist
	@echo "Live at $(DEPLOY_URL) (once GitHub Pages processes the push)."

clean:
	rm -rf dist $(DEPLOY_DIR)
