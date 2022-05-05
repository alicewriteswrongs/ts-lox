import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.137.0/testing/asserts.ts";
import { printAST } from "./AstPrinter.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  spy,
} from "https://deno.land/std@0.137.0/testing/mock.ts";
import Parser from "./Parser.ts";
import { Scanner } from "./Scanner.ts";
const { test } = Deno;

const testParsing = (source: string) => {
  const logStub = spy();
  const scanner = new Scanner(
    source,
    (line: number, message: string) => logStub(line, message),
  );
  
  const tokens = scanner.scanTokens()
  const parser = new Parser(
    tokens,
    (line: number, message: string) => logStub(line, message),
  );
  return { parser, logStub };
};

test("should parse a simple binary expression", () => {
  const AST = testParsing("1 + 2").parser.parse();
  if (AST) {
    assertNotEquals(AST, null);
    assertEquals(AST.exprType, "Binary");
    assertEquals(printAST(AST), "(+ 1 2)");
  }
});

test("should parse a ternary correctly", () => {
  const AST = testParsing("1 ? 2 : 3").parser.parse()
  assertEquals(printAST(AST!), '(Ternary 1 2 3)')
})

test("should parse nested ternaries correctly", () => {
  const AST = testParsing("1 ? 4 ? 5 : 6 : 3").parser.parse()
  assertEquals(printAST(AST!), '(Ternary 1 (Ternary 4 5 6) 3)')
})
