import { useState } from "react";

const BUTTONS: string[][] = [
  ["C", "\u232b", "%", "/"],
  ["7", "8", "9", "*"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "=", ""],
];

export default function Calculator() {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [justCalc, setJustCalc] = useState(false);

  function handleBtn(btn: string) {
    if (btn === "") return;
    if (btn === "C") {
      setDisplay("0");
      setExpression("");
      setJustCalc(false);
      return;
    }
    if (btn === "\u232b") {
      if (display.length <= 1) setDisplay("0");
      else setDisplay(display.slice(0, -1));
      return;
    }
    if (btn === "=") {
      try {
        const result = Function(
          `"use strict"; return (${expression + display})`,
        )();
        const formatted = Number.isFinite(result)
          ? String(Number.parseFloat(result.toFixed(10)))
          : "Error";
        setDisplay(formatted);
        setExpression("");
        setJustCalc(true);
      } catch {
        setDisplay("Error");
        setExpression("");
      }
      return;
    }
    const isOp = ["+", "-", "*", "/"].includes(btn);
    if (isOp) {
      setExpression(expression + display + btn);
      setDisplay("0");
      setJustCalc(false);
      return;
    }
    if (btn === "%") {
      const val = Number.parseFloat(display) / 100;
      setDisplay(String(val));
      return;
    }
    if (justCalc) {
      setDisplay(btn === "." ? "0." : btn);
      setJustCalc(false);
      return;
    }
    if (display === "0" && btn !== ".") {
      setDisplay(btn);
    } else {
      setDisplay(display + btn);
    }
  }

  function isOpBtn(btn: string) {
    return ["+", "-", "*", "/", "=", "%"].includes(btn);
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-[#1e3a5f] text-white shadow-lg flex items-center justify-center hover:bg-[#162d4a] transition-colors text-lg"
        title="Calculator"
        data-ocid="calc.toggle"
      >
        &#x1F522;
      </button>

      {open && (
        <div
          className="absolute bottom-14 right-0 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          style={{ width: 220 }}
        >
          {/* Header */}
          <div className="bg-gray-900 px-3 py-2 flex items-center justify-between">
            <span className="text-white text-xs font-semibold">
              &#x1F522; Calculator
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              &#x2715;
            </button>
          </div>

          {/* Display */}
          <div className="bg-gray-900 px-3 py-2 text-right">
            {expression && (
              <div className="text-slate-400 text-xs truncate">
                {expression}
              </div>
            )}
            <div className="text-white text-2xl font-mono truncate">
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-px bg-slate-200">
            {BUTTONS.map((row, ri) =>
              row.map((btn, ci) => {
                const k = `r${ri}c${ci}`;
                if (btn === "") return <div key={k} className="bg-white" />;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleBtn(btn)}
                    className={`h-12 text-sm font-semibold transition-colors ${
                      btn === "="
                        ? "bg-[#f97316] hover:bg-[#ea6c10] text-white"
                        : isOpBtn(btn)
                          ? "bg-[#1e3a5f] hover:bg-[#162d4a] text-[#f97316]"
                          : btn === "C"
                            ? "bg-red-50 hover:bg-red-100 text-red-600"
                            : "bg-white hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    {btn}
                  </button>
                );
              }),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
