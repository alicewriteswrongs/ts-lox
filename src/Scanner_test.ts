import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  spy,
} from "https://deno.land/std@0.137.0/testing/mock.ts";
import { Scanner } from "./Scanner.ts";
import { TokenType } from "./Token.ts";

const setup = (source: string) => {
  const logStub = spy();
  const scanner = new Scanner(
    source,
    (line: number, message: string) => logStub(line, message),
  );
  return {
    logStub,
    scanner,
  };
};

const assertTokens = (scanner: Scanner, tokens: TokenType[]) => {
  assertEquals(
    scanner.tokens.map((t) => t.type),
    tokens,
  );
};

Deno.test("Scanner should return EOF for empty string", () => {
  const { scanner } = setup("");
  scanner.scanTokens();
  assertTokens(scanner, [TokenType.EOF]);
});

Deno.test("should tokenize some numbers", () => {
  const { scanner } = setup("1 12 144");
  scanner.scanTokens();
  assertTokens(
    scanner,
    [
      TokenType.NUMBER,
      TokenType.NUMBER,
      TokenType.NUMBER,
      TokenType.EOF,
    ],
  );
  assertEquals(
    scanner.tokens.map((t) => t.literal),
    [1, 12, 144, ""],
  );
});

Deno.test("should tokenize a string", () => {
  const { scanner } = setup('"my string"');
  scanner.scanTokens();
  assertTokens(scanner, [TokenType.STRING, TokenType.EOF]);
  assertEquals(scanner.tokens[0].literal, "my string");
});

Deno.test("should tokenize various punctuation", () => {
  const { scanner } = setup("(){},.-+;*!<>?:");
  scanner.scanTokens();
  assertTokens(scanner, [
    TokenType.LEFT_PAREN,
    TokenType.RIGHT_PAREN,
    TokenType.LEFT_BRACE,
    TokenType.RIGHT_BRACE,
    TokenType.COMMA,
    TokenType.DOT,
    TokenType.MINUS,
    TokenType.PLUS,
    TokenType.SEMICOLON,
    TokenType.STAR,
    TokenType.BANG,
    TokenType.LESS,
    TokenType.GREATER,
    TokenType.QUESTION_MARK,
    TokenType.COLON,
    TokenType.EOF,
  ]);
});

Deno.test("should correctly tokenize a few two-character operators", () => {
  const { scanner } = setup("!= == <=  >=");
  scanner.scanTokens();
  assertTokens(scanner, [
    TokenType.BANG_EQUAL,
    TokenType.EQUAL_EQUAL,
    TokenType.LESS_EQUAL,
    TokenType.GREATER_EQUAL,
    TokenType.EOF,
  ]);
});
