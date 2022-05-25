import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.137.0/testing/asserts.ts";
import { printAST } from "./AstPrinter.ts";
import {
  assertSpyCall,
  spy,
} from "https://deno.land/std@0.137.0/testing/mock.ts";
import Parser from "./Parser.ts";
import { Scanner } from "./Scanner.ts";
import { ExpressionStmt } from "./Stmt.ts";
const { test } = Deno;

const testParsing = (source: string) => {
  const logStub = spy();
  const scanner = new Scanner(
    source,
    (line: number, message: string) => logStub(line, message),
  );

  const tokens = scanner.scanTokens();
  const parser = new Parser(
    tokens,
    (line: number, message: string) => {
      logStub(line, message);
    },
  );
  return { parser, logStub };
};

test("should parse a simple binary expression", () => {
  const AST = testParsing("1 + 2;").parser.parse();
  if (AST) {
    console.log(AST
               );
    assertNotEquals(AST[0], null);
    assertEquals(AST[0].nodeType, "ExpressionStmt");
    assertEquals(printAST(AST), "(+ 1 2)");
  }
});

test("should parse a ternary correctly", () => {
  const AST = testParsing("1 ? 2 : 3;").parser.parse() ?? [];
  assertEquals(printAST(AST), "(Ternary 1 2 3)");
});

test("should parse nested ternaries correctly", () => {
  const AST = testParsing("1 ? 4 ? 5 : 6 : 3;").parser.parse() ?? [];
  assertEquals(printAST(AST), "(Ternary 1 (Ternary 4 5 6) 3)");
});

//
["1 ? 2;", "1 ? 2 ? 3;", "1 ? true;"].forEach((badOne) => {
  test(`should give an error for malformed ternaries ${JSON.stringify(badOne)}`, () => {
    const { parser, logStub } = testParsing(badOne);
    parser.parse();
    assertSpyCall(logStub, 0, {
      args: [
        1,
        "? should be paired with a : for a ternary",
      ],
    });
  });
});

/// TODO fix this part
////
//["1 : 2", "1 : 2 : 3", "1 : true"].forEach((badOne) => {
//  test(`should give an error for malformed ternaries ${JSON.stringify(badOne)}`, () => {
//    const { parser, logStub } = testParsing(badOne);
//    parser.parse();
//    assertSpyCall(logStub, 0, {
//      args: [
//        1,
//        ": can't be used on it's own without a leading ?",
//      ],
//    });
//  });
//});

//
[
  "+ + 1",
  "/ 1",
  "* 1",
  ", true",
  ", , , , + + +",
  "== 2",
  "< 3",
  "< < == 2",
  "> 8492",
  ">= 3929239293",
].forEach((operatorInFront) => {
  test(`should error if there's a binary operator in front ${operatorInFront}`, () => {
    const { parser, logStub } = testParsing(operatorInFront);
    parser.parse();
    assertSpyCall(logStub, 0, {
      args: [
        1,
        "looks like we've got a binary operator out front",
      ],
    });
  });
});

test("it should error if you say 'var' with no identifier", () => {
  const { parser, logStub } = testParsing("var = 3;")

})

test('print if statement', () => {
  const { parser, logStub } = testParsing("if (foo) 3;")
  const AST = parser.parse() ?? [];
  console.log(printAST(AST))

})
