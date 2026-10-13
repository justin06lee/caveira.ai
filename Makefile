# make           install dependencies, migrate the database, build the site
# make build     build only
# make install   dependencies and migrations only
# make update    the same as make

.PHONY: all build install update

all: install build

install:
	bun install --frozen-lockfile
	bun run db:migrate

build:
	bun run build

update: all
