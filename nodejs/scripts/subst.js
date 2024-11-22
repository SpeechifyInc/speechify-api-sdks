import fs from "node:fs";
import path from "node:path";

const [from, to, file] = process.argv.slice(2);
const filePath = path.resolve(process.cwd(), file);

const input = fs.readFileSync(filePath, "utf-8");
const output = input.replaceAll(from, to);
fs.writeFileSync(filePath, output, "utf-8");
