#!/bin/bash

function lint {
    deno lint src
}

function run {
    ts-node src/Lox.ts
}

function fmt {
    deno fmt src tool
}

function generate_ast {
    ts-node tool/GenerateAst.ts src
    fmt
}

"$@"
