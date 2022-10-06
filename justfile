default:
    just --list

lint:
    deno lint src tool

run:
    deno run src/Lox.ts

fmt:
    deno fmt src tool

generate_ast: && fmt
    deno run --allow-write tool/GenerateAst.ts src
