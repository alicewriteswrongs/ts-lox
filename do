#!/bin/bash

function run {
    ts-node src/Lox.ts
}

function fmt {
    npx prettier --no-semi --write src/**/*.ts
}

function generate_ast {
    ts-node tool/GenerateAst.ts src
    fmt
}

"$@"
