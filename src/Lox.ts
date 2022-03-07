import { readFileSync } from "fs"
import { prompt } from "enquirer"
import { Scanner } from "./Scanner"

export class Lox {
  main() {
    let args = process.argv
    if (args.length > 3) {
      console.log("Usage: tslox [script]")
      process.exit(64)
    } else if (args.length === 3) {
      this.runFile(args[2])
    } else {
      this.runPrompt()
    }
  }

  runFile(path: string) {
    let contents = String(readFileSync(path))
    this.run(contents)
    if (global.hadError) {
      process.exit(65)
    }
  }

  async runPrompt() {
    while (true) {
      // @ts-ignore
      let { input } = await prompt({
        type: "input",
        message: "",
        name: "input",
      })
      this.run(input)
      global.hadError = false
    }
  }

  run(source: string) {
    console.log(`running ${source}`)
    let scanner = new Scanner(source)
    let tokens = scanner.scanTokens()

    tokens.forEach((token) => {
      console.log(token)
    })
  }

  error(line: number, message: string) {
    this.report(line, "", message)
  }

  report(line: number, where: string, message: string) {
    console.error(`[line ${line}]: Error${where}: ${message}`)
    global.hadError = true
  }
}

export function error(line: number, message: string) {
  report(line, "", message)
}

export function report(line: number, where: string, message: string) {
  console.error(`[line ${line}]: Error${where}: ${message}`)
  global.hadError = true
}

const lox = new Lox()
lox.main()
