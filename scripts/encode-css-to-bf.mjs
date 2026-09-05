import fs from "node:fs";

const [input, output = "src/bf/programs/theme.bf"] = process.argv.slice(2);
if (!input) {
  console.error("Usage: node scripts/encode-css-to-bf.mjs <input.css> [output.bf]");
  process.exit(1);
}

const bytes = fs.readFileSync(input);
let cell = 0;
let bf = "";
for (const byte of bytes) {
  const plus = (byte - cell + 256) % 256;
  const minus = (cell - byte + 256) % 256;
  bf += plus <= minus ? "+".repeat(plus) : "-".repeat(minus);
  bf += ".";
  cell = byte;
}
fs.writeFileSync(output, bf);
console.log(`${bytes.length.toLocaleString()} CSS bytes -> ${bf.length.toLocaleString()} Brainfuck commands`);
