const OPS = new Set([">", "<", "+", "-", ".", ",", "[", "]"]);

export type BFResult = {
  output: number[];
  steps: number;
  commands: number;
};

export function runBrainfuck(source: string, input: number[], maxSteps = 2_000_000): BFResult {
  const code = [...source].filter((char) => OPS.has(char));
  const tape = new Uint8Array(30_000);
  const jumps = new Map<number, number>();
  const stack: number[] = [];

  code.forEach((op, index) => {
    if (op === "[") stack.push(index);
    if (op === "]") {
      const start = stack.pop();
      if (start === undefined) throw new Error("Unmatched ]");
      jumps.set(start, index);
      jumps.set(index, start);
    }
  });
  if (stack.length) throw new Error("Unmatched [");

  let pointer = 0;
  let ip = 0;
  let inputIndex = 0;
  let steps = 0;
  const output: number[] = [];

  while (ip < code.length) {
    if (++steps > maxSteps) throw new Error("Brainfuck step limit exceeded");
    const op = code[ip];

    switch (op) {
      case ">":
        pointer++;
        if (pointer >= tape.length) throw new Error("Tape overflow");
        break;
      case "<":
        if (pointer === 0) throw new Error("Tape underflow");
        pointer--;
        break;
      case "+":
        tape[pointer]++;
        break;
      case "-":
        tape[pointer]--;
        break;
      case ".":
        output.push(tape[pointer]);
        break;
      case ",":
        tape[pointer] = input[inputIndex++] ?? 0;
        break;
      case "[":
        if (tape[pointer] === 0) ip = jumps.get(ip) ?? ip;
        break;
      case "]":
        if (tape[pointer] !== 0) ip = jumps.get(ip) ?? ip;
        break;
    }
    ip++;
  }

  return { output, steps, commands: code.length };
}
