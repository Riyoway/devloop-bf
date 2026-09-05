# DevLoop.bf

A deliberately modern React/Vite PWA where Brainfuck owns both the state engine **and the UI stylesheet**.

## Architecture

```text
React events
  -> action.bf
  -> 6-byte state + 12 derived metrics
  -> React renders the document

browser boot
  -> theme.bf
  -> Brainfuck VM emits raw CSS bytes
  -> <style> receives that CSS
```

There is no authored `styles.css` in `src/`. The interface you see is emitted at runtime by `theme.bf`.

## Design direction

The second revision intentionally removes the usual generated-dashboard look:

- no gradients
- no glow
- no floating cards
- almost no border radius
- no giant marketing hero
- no icon soup
- monochrome, dense, utility-first layout
- hairline dividers instead of card containers
- system sans + system monospace only

## Brainfuck is still the majority

Run:

```bash
npm run stats
```

The counter only counts the 8 actual Brainfuck instruction characters in `.bf` files. React/TypeScript is counted as ordinary source characters.

`theme.bf` is intentionally huge because it literally prints the CSS byte-by-byte through the Brainfuck VM.

## Run

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm run preview
```

## State model

Input bytes:

```text
[focus, energy, streak, bugs, ships, coffee]
```

Each action program returns:

```text
[6 updated state bytes, 12 derived metric bytes]
```

Derived metrics:

```text
Score, Chaos, Momentum, Burnout, Quality, Velocity,
Flow, Stability, Pressure, Craft, Risk, Morale
```

## Re-encoding a stylesheet into Brainfuck

For maintenance, there is a tiny encoder. Give it any CSS file and it overwrites `theme.bf`:

```bash
npm run encode:theme -- ./my-theme.css
```

The CSS file is a build-time input only. At runtime the browser receives its stylesheet from Brainfuck.
