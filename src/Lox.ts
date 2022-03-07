import { readFileSync } from "fs";
import { prompt } from "enquirer"

function main() {
  let args = process.argv;
  if (args.length > 3) {
    console.log("Usage: tslox [script]");
    process.exit(64);
  } else if (args.length === 3) {
    runFile(args[2]);
  } else {
    runPrompt();
  }
}

function runFile(path: string) {
  let contents = String(readFileSync(path));
  run(contents);
}

async function runPrompt() {
  while (true) {
    // @ts-ignore
    let { input } = await prompt({
      type: 'input',
      message: "",
      name: "input"
    })
    run(input)
  }
}

function run(source: string) {
  console.log(`running ${source}`);
  // let scanner = new Scanner(source)
  // let tokens = scanner.scanTokens()

  // tokens.forEach(token => {
  //   console.log(token);
  // })
}

main();
