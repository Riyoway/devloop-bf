import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const bfDir = path.join(root, "src", "bf", "programs");
const bfFiles = fs.readdirSync(bfDir).filter((name) => name.endsWith(".bf"));
const counts = bfFiles.map((name) => {
  const text = fs.readFileSync(path.join(bfDir, name), "utf8");
  return [name, text.match(/[><+\-.,[\]]/g)?.length ?? 0];
});
const bfCommands = counts.reduce((sum, [, count]) => sum + count, 0);
const themeCommands = counts.find(([name]) => name === "theme.bf")?.[1] ?? 0;

const sourceFiles = [
  "src/App.tsx",
  "src/main.tsx",
  "src/bf/vm.ts",
  "src/bf/programs.ts",
];
const shellChars = sourceFiles.reduce(
  (sum, name) => sum + fs.readFileSync(path.join(root, name), "utf8").length,
  0,
);

console.log(`Brainfuck commands: ${bfCommands.toLocaleString()}`);
console.log(`  theme.bf: ${themeCommands.toLocaleString()}`);
console.log(`React/TypeScript shell chars: ${shellChars.toLocaleString()}`);
console.log(`BF / shell ratio: ${(bfCommands / shellChars).toFixed(2)}x`);
if (bfCommands <= shellChars) process.exitCode = 1;
