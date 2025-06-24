# ==== Variables ====

APP_NAME := main
APP_SRC := cmd/app/main.go
APP_BIN := tmp/$(APP_NAME)
GO_SOURCES := $(shell find . -path ./vendor -prune -o -path ./tmp -prune -o -name '*.go' -print)

CSS_SRC := static/css/input.css
CSS_OUT := static/css/output.css

AIR := $(shell command -v air)

# ==== Règles principales ====

.PHONY: all run node clean

all: run

$(APP_BIN): $(GO_SOURCES)
	@mkdir -p tmp
	@go build -o $(APP_BIN) $(APP_SRC)

run: node
ifeq ($(AIR),)
	$(MAKE) $(APP_BIN)
	./$(APP_BIN)
else
	$(AIR)
endif

node: clean
	@npm install
	@npx @tailwindcss/cli -i $(CSS_SRC) -o $(CSS_OUT)

clean:
	@rm -rf tmp/ node_modules/
