.PHONY: dev build test typecheck deploy clean

DEPLOY_DIR := .deploy-worktree
DEPLOY_URL := https://ivankovic.codeberg.page/language-learning/

dev:
	bun run dev

build:
	bun run build

test:
	bun run test

typecheck:
	bun run typecheck

# Manual deploy to Codeberg Pages: builds dist/, syncs it into the `pages`
# branch (removing stale hashed assets from the previous build first, since
# Vite renames them on every change), commits only if something actually
# changed, and pushes. Requires a webhook already configured on the `pages`
# branch in the repo's Codeberg settings -- see TODO.md.
deploy: build
	rm -rf $(DEPLOY_DIR)
	if git show-ref --verify --quiet refs/heads/pages; then \
		git worktree add $(DEPLOY_DIR) pages; \
	elif git show-ref --verify --quiet refs/remotes/origin/pages; then \
		git worktree add -b pages $(DEPLOY_DIR) origin/pages; \
	else \
		git worktree add --orphan -b pages $(DEPLOY_DIR); \
	fi
	find $(DEPLOY_DIR) -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
	cp -r dist/. $(DEPLOY_DIR)/
	cd $(DEPLOY_DIR) && git add -A
	cd $(DEPLOY_DIR) && git diff --cached --quiet && echo "Nothing changed, nothing to deploy." || \
		(git commit -m "Deploy $$(date -u +%Y-%m-%dT%H:%M:%SZ)" && git push origin pages)
	git worktree remove $(DEPLOY_DIR) --force
	rm -rf dist
	@echo "Live at $(DEPLOY_URL) (once the webhook processes the push)."

clean:
	rm -rf dist $(DEPLOY_DIR)
