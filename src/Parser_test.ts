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

function testParsesToAST(
  [source, printedAST]: TemplateStringsArray,
  testName: string,
) {
  test(testName, () => {
    const AST = testParsing(source).parser.parse() ?? [];
    assertEquals(printAST(AST), printedAST);
  });
}

testParsesToAST`1 + 2;${"should parse a binary expression"}ExpressionStatement
  BinaryExpression +
    LiteralExpression 1
    LiteralExpression 2`;

testParsesToAST
  `var mynum = 3;${"should parse a variable statement"}VariableStatement mynum
  LiteralExpression 3`;

testParsesToAST`-1;${"should parse a negation"}ExpressionStatement
  UnaryExpression Minus
    LiteralExpression 1`;

testParsesToAST`1 ? 2 : 3;${"should parse a simple ternary"}ExpressionStatement
  TernaryExpression
    LiteralExpression 1
    LiteralExpression 2
    LiteralExpression 3`;

testParsesToAST
  `1 ? 4 ? 5 : 6 : 3;${"should parse nested ternaries correctly"}ExpressionStatement
  TernaryExpression
    LiteralExpression 1
    TernaryExpression
      LiteralExpression 4
      LiteralExpression 5
      LiteralExpression 6
    LiteralExpression 3`;

testParsesToAST`var foo = 3;
var result = 1 + foo;${"should parse declaring a variable, binding the addition"}VariableStatement foo
  LiteralExpression 3
VariableStatement result
  BinaryExpression +
    LiteralExpression 1
    VariableExpression foo`;

testParsesToAST`var if_statements_work = true;

if (if_statements_work) {
    print "they work!";
} else {
    print "they don't :(";
}${"test parsing if statements and print statements"}VariableStatement if_statements_work
  LiteralExpression true
IfStatement
  Condition
    VariableExpression if_statements_work
  ThenBranch
    BlockStatement
      PrintStatement
        LiteralExpression "they work!"
  ElseBranch
    BlockStatement
      PrintStatement
        LiteralExpression "they don't :("`;

testParsesToAST`true and false;${"should support 'and' keyword"
}ExpressionStatement
  LogicalExpression And
    LiteralExpression true
    LiteralExpression false`;

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
  const { parser, logStub } = testParsing("var = 3;");
  parser.parse();
  assertSpyCall(logStub, 0, {
    args: [
      1,
      "Expect variable name.",
    ],
  });
});
