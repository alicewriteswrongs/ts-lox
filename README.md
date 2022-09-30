# ts-lox

This is my TypeScript implementation of the JLox tree-walk interpreter for the
Lox programming language, as presented in [Crafting
Interpreters](https://craftinginterpreters.com/).

Run it by just doing:

```sh
./src/Lox.ts ./path/to/script.lox
```

or

```sh
./src/Lox.ts
```

to get a REPL. You can also pass a `--printAST` flag to print out a string
representation of the AST for your program (or the line you just entered at the
REPL).

The only dependency is Deno.
