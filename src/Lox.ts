#!/usr/bin/env -S deno run --allow-read
import { printAST } from "./AstPrinter.ts";
import { Environment } from "./Environment.ts";
import { interpret, interpretExpression, stringify } from "./Interpreter.ts";
import Parser from "./Parser.ts";
import { Scanner } from "./Scanner.ts";
import { Stmt } from "./Stmt.ts";

export class Lox {
  hadError = false;
  hadRuntimeError = false;

  main() {
    const args = Deno.args;
    if (args.length > 1) {
      console.log("Usage: tslox [script]");
      Deno.exit(64);
    } else if (args.length === 1) {
      this.runFile(args[0]);
    } else {
      this.runPrompt();
    }
  }

  async runFile(path: string) {
    const contents = await Deno.readTextFile(path);
    this.run(contents);
    if (this.hadError) {
      Deno.exit(65);
    }
    if (this.hadRuntimeError) {
      Deno.exit(70);
    }
  }

  runPrompt() {
    const replRootEnvironment = new Environment();
    while (true) {
      const input = prompt(">");
      this.repl(input ?? "", replRootEnvironment);
      this.hadError = false;
    }
  }

  parseSource(source: string): Stmt[] {
    // create a scanner and scan it to produce a list of tokens
    const scanner = new Scanner(
      source,
      (line: number, message: string) => this.error(line, message),
    );
    const tokens = scanner.scanTokens();

    // pass those tokens to a Parser and parse them into an AST
    const parser = new Parser(
      tokens,
      (line: number, message: string) => this.error(line, message),
    );
    const statements = parser.parse();
    if (statements) {
      return statements;
    } else {
      return [];
    }
  }

  repl(source: string, environment: Environment) {
    const statements = this.parseSource(source);

    if (statements[0] && statements[0].nodeType === "ExpressionStmt") {
      const { expression } = statements[0];
      // this is a bit of a hack, but enables the normal behavior you'd
      // expect in a REPL where typing in the name of a variable will just
      // print it out for you.
      console.log(stringify(interpretExpression(expression, environment)));
    } else {
      interpret(
        statements,
        (line: number, message: string) => this.error(line, message),
        environment,
      );
    }

    console.log(printAST(statements ?? []));
  }

  run(source: string) {
    const statements = this.parseSource(source);

    // interpret that expression and show the result
    if (statements) {
      interpret(
        statements,
        (line: number, message: string) => this.error(line, message),
      );
    }
  }

  error(line: number, message: string) {
    this.report(line, "", message);
  }

  runtimeError(line: number, message: string) {
    console.error(`[line ${line}]: RuntimeError: ${message}`);
    this.hadRuntimeError = true;
  }

  report(line: number, where: string, message: string) {
    console.error(`[line ${line}]: Error${where}: ${message}`);
    this.hadError = true;
  }
}

const lox = new Lox();
lox.main();
