#!/bin/bash

function lint {
    deno lint src
}

function run {
    deno run src/Lox.ts
}

function fmt {
    deno fmt src tool
}

function generate_ast {
    deno run --allow-write tool/GenerateAst.ts src
    fmt
}

"$@"
