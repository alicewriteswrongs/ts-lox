function main() {
  const args = Deno.args;

  if (args.length != 1) {
    console.log("Usage: generate_ast [output directory]");
    Deno.exit(64);
  } else {
    const outputDir = args[0];

    defineAst(outputDir, "Expr", [
      "Binary   | left: Expr, operator: Token, right: Expr",
      "Grouping | expression: Expr",
      "Literal  | value: Object",
      "Unary    | operator: Token, right: Expr",
    ]);
  }
}

function defineAst(
  outputDir: string,
  baseName: string,
  types: string[],
) {
  const path = outputDir + "/" + baseName + ".ts";

  const fileContents: string[] = [];

  fileContents.push(`abstract class ${baseName} {`);
  fileContents.push("}");
  fileContents.push("");

  types.forEach((typeString) => {
    const [className, fields] = typeString.split("|").map((str) => str.trim());
    defineType(
      fileContents,
      baseName,
      className,
      fields,
    );
  });

  const encoder = new TextEncoder();
  Deno.writeFileSync(path, encoder.encode(fileContents.join("\n")));
}

function defineType(
  lines: string[],
  baseName: string,
  className: string,
  fieldList: string,
) {
  lines.push(`export class ${className} extends ${baseName} {`);
  // add types for instance fields
  fieldList.split(",").forEach((f) => lines.push(f));
  lines.push("");

  // write the constructor
  lines.push(`constructor (${fieldList}) {`);
  lines.push("super()");
  fieldList.split(",").forEach((field) => {
    const name = field.split(":")[0];
    lines.push(`this.${name} = ${name}`);
  });
  lines.push("}");
  lines.push("}");
  lines.push("");
}

main();
