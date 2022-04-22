import { printAST } from "./AstPrinter";
import Parser from "./Parser";
import { Scanner } from "./Scanner";
import { readFile } from "fs/promises"
import prompt from 'prompt-sync'

export class Lox {
  hadError = false;

  main() {
    const args = process.argv;
    if (args.length > 3) {
      console.log("Usage: tslox [script]");
      process.exit(64);
    } else if (args.length === 3) {
      this.runFile(args[2]);
    } else {
      this.runPrompt();
    }
  }

  async runFile(path: string) {
    const contents = await readFile(path);
    this.run(String(contents));
    if (this.hadError) {
      process.exit(65);
    }
  }

  runPrompt() {
    while (true) {
      const input = prompt({
        sigint: true,
        eot: true
      } as any)("> ");

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

    // pass those tokens to a Parser and parse them into an AST
    const parser = new Parser(
      tokens,
      (line: number, message: string) => this.error(line, message),
    );
    const expression = parser.parse();

    if (expression) {
      console.log("AST:");
      console.log(printAST(expression));
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
