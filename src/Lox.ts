import { printAST } from "./AstPrinter.ts";
import Parser from "./Parser.ts";
import { Scanner } from "./Scanner.ts";

export class Lox {
  hadError = false;

  main() {
    const args = Deno.args;
    if (args.length > 3) {
      console.log("Usage: tslox [script]");
      Deno.exit(64);
    } else if (args.length === 3) {
      this.runFile(args[2]);
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
  }

  runPrompt() {
    while (true) {
      const input = prompt(">");
      this.run(input ?? "");
      this.hadError = false;
    }
  }

  run(source: string) {
    console.log(`running ${source}`);

    // create a scanner and scan it to produce a list of tokens
    const scanner = new Scanner(
      source,
      (line: number, message: string) => this.error(line, message),
    );
    const tokens = scanner.scanTokens();

    console.log("tokens:");
    tokens.forEach((token) => {
      console.log(token);
    });

    // pass those tokens to a Parser and parse them into an AST
    const parser = new Parser(tokens, this.error);
    const expression = parser.parse();

    if (expression) {
      console.log("AST:");
      console.log(printAST(expression));
      console.log(expression);
    }
  }

  error(line: number, message: string) {
    this.report(line, "", message);
  }

  report(line: number, where: string, message: string) {
    console.error(`[line ${line}]: Error${where}: ${message}`);
    this.hadError = true;
  }
}

const lox = new Lox();
lox.main();
