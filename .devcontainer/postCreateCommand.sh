#!/bin/zsh

sudo chown -R vscode:vscode node_modules
bun install --frozen-lockfile
bunx --bun biome migrate --write
