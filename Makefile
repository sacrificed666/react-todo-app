# ✅ Tasks: run `make` to list every command
SHELL := /bin/bash
.DEFAULT_GOAL := help
.SILENT:

ENV ?= development
ENVS := development staging production
COMPOSE = docker compose -f compose.yaml -f docker/$(ENV).yaml
NODE_MIN := 24
PORT ?= 5173
PREVIEW_PORT := 4173
BASE := /react-todo-app/

# Colours and emoji, off with NO_COLOR=1 or when the output is not a terminal
ifeq ($(NO_COLOR)$(shell [ -t 2 ] || echo pipe),)
  B := \033[1m
  D := \033[2m
  R := \033[31m
  G := \033[32m
  Y := \033[33m
  C := \033[36m
  M := \033[35m
  X := \033[0m
endif

step = printf "\n$(B)$(C)▶ %s$(X)\n" "$(1)"
ok = printf "$(G)✅ %s$(X)\n" "$(1)"
warn = printf "$(Y)⚠️  %s$(X)\n" "$(1)"
fail = { printf "$(R)❌ %s$(X)\n" "$(1)"; exit 1; }
opener = $(shell command -v open || command -v xdg-open || echo echo)

##@ 📖 Help

help: ## 📖 Show every command
	printf "\n$(B)✅ Tasks$(X) $(D)make <command> [ENV=development|staging|production]$(X)\n"
	awk 'BEGIN {FS = ":.*## "} /^##@/ {printf "\n$(B)%s$(X)\n", substr($$0, 5)} /^[a-zA-Z0-9_-]+:.*## / {printf "  $(C)%-15s$(X) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	printf "\n$(D)Examples: make setup · make dev · make up ENV=staging · make logs$(X)\n\n"

##@ 🧰 Setup

setup: install env browsers ## 🧰 Everything for the first run: packages, .env and browsers
	$(call ok,Ready. Next: make dev)

install: node-version ## 📦 Install the exact dependencies from package-lock.json
	$(call step,Installing dependencies)
	npm ci

env: ## 🔐 Create the env file from .env.example if it is missing
	if [ -f .env ]; then $(call ok,.env already exists); \
	else cp .env.example .env && $(call ok,Created .env from .env.example: it only sets Docker ports); fi

browsers: ## 🎭 Install Chromium for the end-to-end tests
	$(call step,Installing Playwright Chromium)
	npx playwright install chromium

node-version:
	major=$$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0); \
	if [ "$$major" -lt "$(NODE_MIN)" ]; then $(call fail,Node.js $(NODE_MIN) or newer is required (found $$(node -v 2>/dev/null || echo none))); fi

doctor: ## 🩺 Check Node, npm, Docker and the env file
	$(call step,Checking the tools)
	printf "  %-10s %s\n" "Node.js" "$$(node -v 2>/dev/null || echo missing)" "npm" "$$(npm -v 2>/dev/null || echo missing)" "Docker" "$$(docker --version 2>/dev/null | cut -d, -f1 | sed 's/Docker version //' || echo missing)"
	$(MAKE) --no-print-directory node-version && $(call ok,Node.js $(NODE_MIN)+ found)
	[ -d node_modules ] && $(call ok,Dependencies installed) || $(call warn,Dependencies missing: run make install)
	$(call ok,Tasks needs no API keys: everything runs in the browser)

##@ 💻 Development

dev: node-version ## 🚀 Start the dev server on PORT (5173)
	npx vite --port $(PORT)

build: node-version ## 🏗️  Type-check and build for production into dist/
	$(call step,Building)
	npm run build

preview: ## 👀 Serve the production build on port 4173
	npx vite preview --port $(PREVIEW_PORT)

open: ## 🌐 Open the app in the browser
	$(opener) http://localhost:$(PORT)$(BASE)

flags: ## 🏳️  Copy the language flags into public/
	npm run flags

##@ ✅ Quality

lint: ## 🔍 Lint the code with Oxlint
	npm run lint

fix: ## 🪄 Fix lint findings and format everything
	npm run lint:fix
	npm run format
	$(call ok,Fixed and formatted)

format: ## 🎨 Format the code with Oxfmt
	npm run format

typecheck: ## 🧠 Check the types
	npm run typecheck

test: ## 🧪 Run the unit tests once
	npm run test:run

test-watch: ## 👀 Run the unit tests on every change
	npm test

coverage: ## 📊 Run the unit tests with coverage
	npm run test:coverage

e2e: ## 🎭 Run the end-to-end tests with axe and Lighthouse
	npm run test:e2e

e2e-ui: ## 🖱️  Open the end-to-end tests in the Playwright UI
	npx playwright test --ui

check: ## ✅ Lint, format check, types and unit tests
	$(call step,Checking everything)
	npm run check
	$(call ok,All checks passed)

ci: check build e2e ## 🚦 What CI runs: checks, build and end-to-end tests
	$(call ok,CI passed)

##@ 🐳 Docker  (ENV=development, staging or production)

env-guard:
	$(if $(filter $(ENV),$(ENVS)),,$(call fail,ENV must be one of: $(ENVS)))

up: env-guard ## 🚀 Start ENV: development with hot reload, others in the background
	if [ "$(ENV)" = development ]; then \
	  $(call step,Starting $(ENV) with hot reload); $(COMPOSE) up --build --watch; \
	else \
	  $(call step,Starting $(ENV) in the background); $(COMPOSE) up --build -d && $(call ok,$(ENV) is running: make logs ENV=$(ENV)); \
	fi

down: env-guard ## 🛑 Stop ENV and remove its containers
	$(COMPOSE) down
	$(call ok,$(ENV) stopped)

restart: env-guard ## 🔄 Rebuild and restart ENV
	$(COMPOSE) down
	$(MAKE) --no-print-directory up ENV=$(ENV)

logs: env-guard ## 📜 Follow the logs of ENV
	$(COMPOSE) logs -f --tail=100

ps: env-guard ## 📋 Show the containers of ENV
	$(COMPOSE) ps

build-image: env-guard ## 🏗️  Build the image of ENV without starting it
	$(call step,Building tasks:$(ENV))
	$(COMPOSE) build
	$(call ok,Image tasks:$(ENV) built)

shell: env-guard ## 🐚 Open a shell in the running ENV container
	$(COMPOSE) exec app sh

config: env-guard ## 🧾 Print the merged Compose configuration of ENV
	$(COMPOSE) config

docker-clean: env-guard ## 🧹 Remove the containers, volumes and images of ENV
	$(COMPOSE) down --rmi local --volumes --remove-orphans
	$(call ok,$(ENV) cleaned up)

dev-docker: ## 🐳 Shortcut: make up ENV=development
	$(MAKE) --no-print-directory up ENV=development

staging: ## 🧪 Shortcut: make up ENV=staging
	$(MAKE) --no-print-directory up ENV=staging

production: ## 🏭 Shortcut: make up ENV=production
	$(MAKE) --no-print-directory up ENV=production

##@ 📦 Maintenance

outdated: ## 📦 List outdated packages
	npm outdated || true

audit: ## 🛡️  Check the dependencies for known vulnerabilities
	npm audit

clean: ## 🧹 Remove build output, caches and reports
	rm -rf dist coverage test-results playwright-report node_modules/.vite tsconfig.tsbuildinfo
	$(call ok,Cleaned)

reset: clean ## ♻️  Clean, then reinstall the dependencies from scratch
	rm -rf node_modules
	$(MAKE) --no-print-directory install

info: ## ℹ️  Show the versions of the app and the tools
	printf "  %-10s %s\n" "Tasks" "$$(node -p "require('./package.json').version")" "Node.js" "$$(node -v)" "npm" "$$(npm -v)" "Docker" "$$(docker --version 2>/dev/null | cut -d, -f1 | sed 's/Docker version //' || echo missing)"

.PHONY: help setup install env browsers node-version doctor dev build preview open flags lint fix format typecheck test test-watch coverage e2e e2e-ui check ci env-guard up down restart logs ps build-image shell config docker-clean dev-docker staging production outdated audit clean reset info
