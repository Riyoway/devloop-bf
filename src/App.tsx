import React, { useEffect, useMemo, useState } from "react";
import { programs, themeProgram, type ProgramName } from "./bf/programs";
import { runBrainfuck } from "./bf/vm";

type BaseState = [number, number, number, number, number, number];
type Model = { base: BaseState; metrics: number[] };
type Trace = {
  name: ProgramName;
  input: number[];
  output: number[];
  steps: number;
  commands: number;
};

const DEFAULT: BaseState = [4, 7, 2, 3, 1, 0];
const baseLabels = ["Focus", "Energy", "Streak", "Bugs", "Ships", "Coffee"];
const metricLabels = [
  "Score",
  "Chaos",
  "Momentum",
  "Burnout",
  "Quality",
  "Velocity",
  "Flow",
  "Stability",
  "Pressure",
  "Craft",
  "Risk",
  "Morale",
];

const actions: Array<{
  key: Exclude<ProgramName, "inspect" | "reset">;
  label: string;
  hint: string;
  delta: BaseState;
}> = [
  { key: "focus", label: "Focus", hint: "deep work", delta: [1, -2, 1, 0, 0, 0] },
  { key: "sprint", label: "Sprint", hint: "move fast", delta: [2, -3, 1, 1, 0, 0] },
  { key: "rest", label: "Rest", hint: "recover", delta: [-1, 3, 0, 0, 0, 0] },
  { key: "coffee", label: "Coffee", hint: "borrow energy", delta: [0, 2, 0, 1, 0, 1] },
  { key: "debug", label: "Debug", hint: "reduce defects", delta: [-1, -1, 1, -2, 0, 0] },
  { key: "ship", label: "Ship", hint: "release", delta: [-2, -2, 1, -1, 1, 0] },
  { key: "docs", label: "Docs", hint: "write it down", delta: [-1, -1, 1, -1, 0, 0] },
  { key: "doomscroll", label: "Doomscroll", hint: "lose the plot", delta: [-3, 1, -2, 0, 0, 0] },
];

const themeResult = runBrainfuck(themeProgram, [], 2_000_000);
const themeCss = new TextDecoder().decode(Uint8Array.from(themeResult.output));

function execute(name: ProgramName, base: BaseState) {
  const result = runBrainfuck(programs[name], base);
  if (result.output.length !== 18) throw new Error(`${name}.bf returned ${result.output.length} bytes`);
  return {
    model: {
      base: result.output.slice(0, 6) as BaseState,
      metrics: result.output.slice(6),
    },
    trace: {
      name,
      input: [...base],
      output: result.output,
      steps: result.steps,
      commands: result.commands,
    } satisfies Trace,
  };
}

function readSaved(): BaseState {
  try {
    const value = JSON.parse(localStorage.getItem("devloop.bf") ?? "null");
    if (
      Array.isArray(value) &&
      value.length === 6 &&
      value.every((item) => Number.isInteger(item) && item >= 0 && item <= 9)
    ) {
      return value as BaseState;
    }
  } catch {}
  return DEFAULT;
}

function canApply(base: BaseState, delta: BaseState) {
  return base.every((value, index) => {
    const next = value + delta[index];
    return next >= 0 && next <= 9;
  });
}

function deltaLabel(delta: BaseState) {
  return delta
    .map((value, index) => (value === 0 ? null : `${baseLabels[index].toLowerCase()} ${value > 0 ? "+" : ""}${value}`))
    .filter(Boolean)
    .join(" / ");
}

export default function App() {
  const initial = useMemo(() => execute("inspect", readSaved()), []);
  const [model, setModel] = useState<Model>(initial.model);
  const [trace, setTrace] = useState<Trace>(initial.trace);
  const [error, setError] = useState("");

  const run = (name: ProgramName) => {
    try {
      const next = execute(name, model.base);
      setModel(next.model);
      setTrace(next.trace);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  useEffect(() => {
    localStorage.setItem("devloop.bf", JSON.stringify(model.base));
  }, [model.base]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const index = Number(event.key) - 1;
      const action = actions[index];
      if (action && canApply(model.base, action.delta)) run(action.key);
      if (event.key.toLowerCase() === "r") run("reset");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <style>{themeCss}</style>
      <main className="app-shell">
        <header className="app-header">
          <div className="brand">
            <strong>DevLoop.bf</strong>
            <span>local state simulator</span>
          </div>
          <div className="runtime-line" aria-label="runtime status">
            <span className="status-mark" />
            <span>bf vm</span>
            <code>{trace.steps.toLocaleString()} steps</code>
            <span className="runtime-separator">/</span>
            <span>stylesheet</span>
            <code>{themeResult.commands.toLocaleString()} bf ops</code>
          </div>
          <button className="reset-button" onClick={() => run("reset")}>reset <kbd>R</kbd></button>
        </header>

        <div className="intro-line">
          <p>State transitions and the entire interface stylesheet are executed from Brainfuck.</p>
          <code>uint8[6] -&gt; bf -&gt; uint8[18]</code>
        </div>

        <section className="overview" aria-label="overview">
          <div className="score-block">
            <span className="overline">score</span>
            <output>{model.metrics[0]}</output>
            <span className="score-context">derived by inspect.bf</span>
          </div>
          <div className="overview-metrics">
            {metricLabels.slice(1, 6).map((label, index) => (
              <div className="overview-cell" key={label}>
                <span>{label}</span>
                <strong>{model.metrics[index + 1]}</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="workbench">
          <section className="panel state-panel">
            <div className="panel-head">
              <div>
                <h2>State vector</h2>
                <span>6 bytes / persistent</span>
              </div>
              <code>[{model.base.join(", ")}]</code>
            </div>

            <div className="state-list">
              {model.base.map((value, index) => (
                <div className="state-row" key={baseLabels[index]}>
                  <span className="state-label">{baseLabels[index]}</span>
                  <div className="state-track" aria-hidden="true">
                    <i style={{ width: `${value * 10}%` }} />
                  </div>
                  <strong>{value}</strong>
                  <span className="state-max">/9</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel command-panel">
            <div className="panel-head">
              <div>
                <h2>Commands</h2>
                <span>keyboard 1-8</span>
              </div>
              <code>{trace.name}.bf</code>
            </div>

            <div className="command-list">
              {actions.map((action, index) => {
                const enabled = canApply(model.base, action.delta);
                return (
                  <button
                    className="command-row"
                    key={action.key}
                    disabled={!enabled}
                    onClick={() => run(action.key)}
                    title={!enabled ? "Would leave the 0-9 safe range" : deltaLabel(action.delta)}
                  >
                    <kbd>{index + 1}</kbd>
                    <span className="command-name">{action.label}</span>
                    <span className="command-hint">{action.hint}</span>
                    <code>{deltaLabel(action.delta)}</code>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section className="metrics-table" aria-label="derived metrics">
          <div className="table-head">
            <h2>Derived</h2>
            <span>12 values computed in Brainfuck after every action</span>
          </div>
          <div className="metric-grid">
            {metricLabels.map((label, index) => (
              <div className="metric-cell" key={label}>
                <span>{label}</span>
                <strong>{model.metrics[index]}</strong>
                <code>{String(index).padStart(2, "0")}</code>
              </div>
            ))}
          </div>
        </section>

        <details className="inspector">
          <summary>
            <span>Execution trace</span>
            <div>
              <code>{trace.name}.bf</code>
              <span>{trace.commands.toLocaleString()} commands</span>
            </div>
          </summary>
          <div className="trace-body">
            <div className="trace-row">
              <span>input</span>
              <code>[{trace.input.join(", ")}]</code>
            </div>
            <div className="trace-row">
              <span>output</span>
              <code>[{trace.output.join(", ")}]</code>
            </div>
            <div className="trace-row">
              <span>executed</span>
              <code>{trace.steps.toLocaleString()} vm steps</code>
            </div>
            <div className="trace-row">
              <span>ui css</span>
              <code>{themeResult.output.length.toLocaleString()} bytes emitted by theme.bf</code>
            </div>
          </div>
        </details>

        {error && <div className="error-line"><strong>vm error</strong><code>{error}</code></div>}

        <footer className="app-footer">
          <span>React renders. Brainfuck decides.</span>
          <span>no server / localStorage / PWA</span>
        </footer>
      </main>
    </>
  );
}
