// Safe in-browser Python-to-JavaScript transpiler and runner for educational coding sandboxes (CodeArena, BugHunter, CloudStudio)

export interface PythonExecutionResult {
  stdout: string[];
  returnValue: unknown;
  error?: string;
}

function getIndent(line: string): number {
  let count = 0;
  for (const ch of line) {
    if (ch === " ") count++;
    else if (ch === "\t") count += 4;
    else break;
  }
  return count;
}

function transformPythonExpr(expr: string): string {
  let out = expr.trim();

  // Protect strings before identifier substitutions
  const strings: string[] = [];
  out = out.replace(/f?(["'])(?:(?=(\\?))\2.)*?\1/g, (m) => {
    const idx = strings.length;
    if (m.startsWith("f")) {
      const inner = m.slice(2, -1).replace(/\{([^}]+)\}/g, (_, code) => `\${${transformPythonExpr(code)}}`);
      strings.push("`" + inner + "`");
    } else {
      strings.push(m);
    }
    return `__PYSTR_${idx}__`;
  });

  // Python ternary: A if COND else B
  const ternaryMatch = out.match(/^(.+?)\s+if\s+(.+?)\s+else\s+(.+)$/);
  if (ternaryMatch && !out.startsWith("[")) {
    out = `(${transformPythonExpr(ternaryMatch[2])} ? ${transformPythonExpr(ternaryMatch[1])} : ${transformPythonExpr(ternaryMatch[3])})`;
  }

  // List comprehension: [expr for x in iter] or [expr for x in iter if cond]
  out = out.replace(/\[([^\[\]]+?)\s+for\s+([a-zA-Z_]\w*)\s+in\s+([^\[\]]+?)(?:\s+if\s+([^\[\]]+?))?\]/g, (_, body, varName, iterExpr, condExpr) => {
    const iter = `__py_iter(${transformPythonExpr(iterExpr)})`;
    const mapped = transformPythonExpr(body);
    if (condExpr) {
      return `${iter}.filter((${varName}) => ${transformPythonExpr(condExpr)}).map((${varName}) => ${mapped})`;
    }
    return `${iter}.map((${varName}) => ${mapped})`;
  });

  // Keywords & operators
  out = out
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false")
    .replace(/\bNone\b/g, "null")
    .replace(/\bis\s+not\s+null\b/g, "!== null")
    .replace(/\bis\s+null\b/g, "=== null")
    .replace(/\band\b/g, "&&")
    .replace(/\bor\b/g, "||")
    .replace(/\bnot\s+in\b/g, "__PY_NOT_IN__")
    .replace(/\bnot\b/g, "!")
    .replace(/\*\*/g, "**");

  // Python integer floor division `lhs // rhs` (supports parenthesized expressions like `(low + high) // 2`)
  out = out.replace(/(\([^()]+\)|[a-zA-Z0-9_.\[\]]+)\s*\/\/\s*(\([^()]+\)|[a-zA-Z0-9_.\[\]]+)/g, "Math.floor(($1) / ($2))");

  // `x in y` & `x not in y`
  out = out.replace(/([a-zA-Z0-9_.'"\[\]]+)\s+__PY_NOT_IN__\s+([a-zA-Z0-9_.\(\)\[\]]+)/g, "!__py_in($1, $2)");
  out = out.replace(/([a-zA-Z0-9_.'"\[\]]+)\s+in\s+([a-zA-Z0-9_.\(\)\[\]]+)/g, "__py_in($1, $2)");

  // Slicing: arr[::-1] or arr[a:b]
  out = out.replace(/([a-zA-Z_]\w*)\[::-1\]/g, "__py_rev($1)");
  out = out.replace(/([a-zA-Z_]\w*)\[([^:\[\]]*):([^:\[\]]*)\]/g, (_, arr, start, end) => {
    const s = start.trim() || "0";
    const e = end.trim() || "undefined";
    return `${arr}.slice(${s}, ${e})`;
  });

  // Built-in functions & common methods
  out = out
    .replace(/\blen\s*\(/g, "__py_len(")
    .replace(/\bsum\s*\(/g, "__py_sum(")
    .replace(/\bmin\s*\(/g, "__py_min(")
    .replace(/\bmax\s*\(/g, "__py_max(")
    .replace(/\babs\s*\(/g, "Math.abs(")
    .replace(/\bround\s*\(/g, "__py_round(")
    .replace(/\bint\s*\(/g, "parseInt(")
    .replace(/\bfloat\s*\(/g, "parseFloat(")
    .replace(/\bstr\s*\(/g, "String(")
    .replace(/\bbool\s*\(/g, "Boolean(")
    .replace(/\blist\s*\(/g, "Array.from(")
    .replace(/\bsorted\s*\(/g, "__py_sorted(")
    .replace(/\brange\s*\(/g, "__py_range(")
    .replace(/\benumerate\s*\(/g, "__py_enum(")
    .replace(/\bprint\s*\(/g, "__py_print(")
    .replace(/\binput\s*\(/g, "__py_input(")
    .replace(/\.append\s*\(/g, ".push(")
    .replace(/\.capitalize\s*\(\)/g, ".replace(/^./, c => c.toUpperCase())")
    .replace(/\.upper\s*\(\)/g, ".toUpperCase()")
    .replace(/\.lower\s*\(\)/g, ".toLowerCase()")
    .replace(/\.strip\s*\(\)/g, ".trim()")
    .replace(/\.items\s*\(\)/g, "__PY_ITEMS__")
    .replace(/([a-zA-Z_]\w*)__PY_ITEMS__/g, "Object.entries($1)")
    .replace(/\.keys\s*\(\)/g, "__PY_KEYS__")
    .replace(/([a-zA-Z_]\w*)__PY_KEYS__/g, "Object.keys($1)")
    .replace(/\.values\s*\(\)/g, "__PY_VALUES__")
    .replace(/([a-zA-Z_]\w*)__PY_VALUES__/g, "Object.values($1)")
    .replace(/\.get\s*\(\s*([^,)]+)\s*,\s*([^)]+)\s*\)/g, "__PY_GET($1, $2)")
    .replace(/([a-zA-Z_]\w*)__PY_GET\(([^,]+),\s*([^)]+)\)/g, "($1[$2] ?? $3)");

  // Restore strings
  out = out.replace(/__PYSTR_(\d+)__/g, (_, i) => strings[Number(i)]);
  return out;
}

export function transpilePythonToJs(pyCode: string): { js: string; declaredFunctions: string[] } {
  const rawLines = pyCode.replace(/\r\n/g, "\n").split("\n");
  const jsLines: string[] = [];
  const indentStack: number[] = [0];
  const declaredVarsStack: Set<string>[] = [new Set()];
  const declaredFunctions: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    // Strip trailing inline comments outside quotes cleanly (simple heuristic for # comments)
    let codePart = raw;
    let inS = false;
    let inD = false;
    for (let c = 0; c < raw.length; c++) {
      if (raw[c] === "'" && !inD) inS = !inS;
      else if (raw[c] === '"' && !inS) inD = !inD;
      else if (raw[c] === "#" && !inS && !inD) {
        codePart = raw.slice(0, c);
        break;
      }
    }

    const trimmed = codePart.trim();
    if (!trimmed) continue;

    const indent = getIndent(codePart);
    while (indent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      declaredVarsStack.pop();
      jsLines.push(`${" ".repeat(indentStack[indentStack.length - 1])}}`);
    }

    const pad = " ".repeat(indent);

    // Function definition: def foo(a: int, b=0) -> list[int]:
    const defMatch = trimmed.match(/^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)(?:\s*->\s*[^:]+)?\s*:$/);
    if (defMatch) {
      const fnName = defMatch[1];
      declaredFunctions.push(fnName);
      const params = defMatch[2]
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const eqIdx = p.indexOf("=");
          if (eqIdx !== -1) {
            const left = p.slice(0, eqIdx).split(":")[0].trim();
            const right = transformPythonExpr(p.slice(eqIdx + 1).trim());
            return `${left} = ${right}`;
          }
          return p.split(":")[0].trim();
        })
        .join(", ");

      jsLines.push(`${pad}function ${fnName}(${params}) {`);
      indentStack.push(indent + 4);
      declaredVarsStack.push(new Set(defMatch[2].split(",").map((p) => p.split(":")[0].split("=")[0].trim()).filter(Boolean)));
      continue;
    }

    // if / elif / else
    const ifMatch = trimmed.match(/^if\s+(.+):$/);
    if (ifMatch) {
      jsLines.push(`${pad}if (${transformPythonExpr(ifMatch[1])}) {`);
      indentStack.push(indent + 4);
      declaredVarsStack.push(new Set(declaredVarsStack[declaredVarsStack.length - 1]));
      continue;
    }
    const elifMatch = trimmed.match(/^elif\s+(.+):$/);
    if (elifMatch) {
      jsLines.push(`${pad}else if (${transformPythonExpr(elifMatch[1])}) {`);
      indentStack.push(indent + 4);
      declaredVarsStack.push(new Set(declaredVarsStack[declaredVarsStack.length - 1]));
      continue;
    }
    if (/^else\s*:$/.test(trimmed)) {
      jsLines.push(`${pad}else {`);
      indentStack.push(indent + 4);
      declaredVarsStack.push(new Set(declaredVarsStack[declaredVarsStack.length - 1]));
      continue;
    }

    // for tuple/var in iter:
    const forMatch = trimmed.match(/^for\s+([a-zA-Z_][\w,\s]*)\s+in\s+(.+):$/);
    if (forMatch) {
      const target = forMatch[1].trim();
      const iter = transformPythonExpr(forMatch[2]);
      if (target.includes(",")) {
        jsLines.push(`${pad}for (const [${target}] of __py_iter(${iter})) {`);
      } else {
        jsLines.push(`${pad}for (const ${target} of __py_iter(${iter})) {`);
      }
      indentStack.push(indent + 4);
      const scopeVars = new Set(declaredVarsStack[declaredVarsStack.length - 1]);
      target.split(",").forEach((v) => scopeVars.add(v.trim()));
      declaredVarsStack.push(scopeVars);
      continue;
    }

    // while cond:
    const whileMatch = trimmed.match(/^while\s+(.+):$/);
    if (whileMatch) {
      jsLines.push(`${pad}while (${transformPythonExpr(whileMatch[1])}) { __py_tick();`);
      indentStack.push(indent + 4);
      declaredVarsStack.push(new Set(declaredVarsStack[declaredVarsStack.length - 1]));
      continue;
    }

    if (trimmed === "pass") {
      jsLines.push(`${pad}/* pass */`);
      continue;
    }
    if (trimmed === "break" || trimmed === "continue") {
      jsLines.push(`${pad}${trimmed};`);
      continue;
    }
    if (trimmed.startsWith("return")) {
      const retVal = trimmed.slice(6).trim();
      jsLines.push(`${pad}return${retVal ? " " + transformPythonExpr(retVal) : ""};`);
      continue;
    }

    // Augmented assignment: x += 1
    const augMatch = trimmed.match(/^([a-zA-Z_][\w\[\].]*)\s*(\+=|-=|\*=|\/=)\s*(.+)$/);
    if (augMatch) {
      jsLines.push(`${pad}${augMatch[1]} ${augMatch[2]} ${transformPythonExpr(augMatch[3])};`);
      continue;
    }

    // Multi-target swap or assignment: a, b = 0, len(nums) - 1
    const multiAssign = trimmed.match(/^([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)+)\s*=\s*(.+)$/);
    if (multiAssign) {
      const lhsVars = multiAssign[1].split(",").map((s) => s.trim());
      const scope = declaredVarsStack[declaredVarsStack.length - 1];
      const allDeclared = lhsVars.every((v) => scope.has(v));
      const rhsExpr = multiAssign[2]
        .split(",")
        .map((s) => transformPythonExpr(s))
        .join(", ");
      if (!allDeclared) {
        lhsVars.forEach((v) => {
          if (!scope.has(v)) {
            jsLines.push(`${pad}let ${v};`);
            scope.add(v);
          }
        });
      }
      jsLines.push(`${pad}[${lhsVars.join(", ")}] = [${rhsExpr}];`);
      continue;
    }

    // Single variable assignment: x = expr (excluding ==, !=, <=, >=)
    const assignMatch = trimmed.match(/^([a-zA-Z_]\w*(?:\[[^\]]+\])*)\s*=(?!=)\s*(.+)$/);
    if (assignMatch) {
      const lhs = assignMatch[1].trim();
      const rhs = transformPythonExpr(assignMatch[2]);
      const scope = declaredVarsStack[declaredVarsStack.length - 1];
      if (!lhs.includes("[") && !lhs.includes(".") && !scope.has(lhs)) {
        scope.add(lhs);
        jsLines.push(`${pad}let ${lhs} = ${rhs};`);
      } else {
        jsLines.push(`${pad}${lhs} = ${rhs};`);
      }
      continue;
    }

    jsLines.push(`${pad}${transformPythonExpr(trimmed)};`);
  }

  while (indentStack.length > 1) {
    indentStack.pop();
    declaredVarsStack.pop();
    jsLines.push(`${" ".repeat(indentStack[indentStack.length - 1])}}`);
  }

  return { js: jsLines.join("\n"), declaredFunctions };
}

const PY_RUNTIME_HELPERS = `
let __py_steps = 0;
const __py_tick = () => { if (++__py_steps > 100000) throw new Error("TimeLimitExceeded: Maximum loop iteration limit exceeded (check for infinite loop)."); };
const __py_len = (x) => (x == null ? 0 : typeof x.length === 'number' ? x.length : typeof x.size === 'number' ? x.size : Object.keys(x).length);
const __py_sum = (arr) => Array.from(arr).reduce((a, b) => a + b, 0);
const __py_min = (...args) => args.length === 1 && Array.isArray(args[0]) ? Math.min(...args[0]) : Math.min(...args);
const __py_max = (...args) => args.length === 1 && Array.isArray(args[0]) ? Math.max(...args[0]) : Math.max(...args);
const __py_round = (n, d = 0) => Number(Number(n).toFixed(d));
const __py_rev = (x) => typeof x === 'string' ? x.split('').reverse().join('') : [...x].reverse();
const __py_sorted = (x, reverse = false) => {
  const copy = [...x].sort((a, b) => typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b)));
  return reverse ? copy.reverse() : copy;
};
const __py_range = (start, stop, step = 1) => {
  if (stop === undefined) { stop = start; start = 0; }
  const res = [];
  if (step > 0) { for (let i = start; i < stop; i += step) res.push(i); }
  else if (step < 0) { for (let i = start; i > stop; i += step) res.push(i); }
  return res;
};
const __py_enum = (x) => Array.from(x).map((v, i) => [i, v]);
const __py_iter = (x) => typeof x === 'string' ? x.split('') : Array.isArray(x) ? x : (x && typeof x === 'object' ? Object.keys(x) : []);
const __py_in = (item, container) => {
  if (typeof container === 'string') return container.includes(String(item));
  if (Array.isArray(container)) return container.includes(item);
  if (container && typeof container === 'object') return String(item) in container;
  return false;
};
`;

export function runPythonScript(pyCode: string, stdinText = ""): PythonExecutionResult {
  const stdout: string[] = [];
  const stdinLines = stdinText.split("\n");
  let stdinIdx = 0;

  try {
    const { js } = transpilePythonToJs(pyCode);
    const runner = new Function(
      "__py_print",
      "__py_input",
      `
      ${PY_RUNTIME_HELPERS}
      ${js}
      `
    );

    const pyPrint = (...args: unknown[]) => {
      stdout.push(
        args
          .map((a) => (typeof a === "object" && a !== null ? JSON.stringify(a) : String(a)))
          .join(" ")
      );
    };
    const pyInput = (prompt = "") => {
      if (prompt) stdout.push(prompt);
      const val = stdinLines[stdinIdx] ?? "";
      stdinIdx++;
      return val;
    };

    const returnValue = runner(pyPrint, pyInput);
    return { stdout, returnValue };
  } catch (err: unknown) {
    return {
      stdout,
      returnValue: undefined,
      error: err instanceof Error ? err.message : "Python runtime error.",
    };
  }
}

export function callPythonFunction(
  pyCode: string,
  candidateFnNames: string[],
  rawArgsExpr: string
): { value: unknown; error?: string } {
  try {
    const { js, declaredFunctions } = transpilePythonToJs(pyCode);
    const targetName =
      candidateFnNames.find((name) => declaredFunctions.includes(name)) || declaredFunctions[0];

    if (!targetName) {
      return { value: undefined, error: `No Python function definition found (expected '${candidateFnNames[0]}').` };
    }

    const runner = new Function(
      "__py_print",
      "__py_input",
      `
      ${PY_RUNTIME_HELPERS}
      ${js}
      const parsedInput = [${rawArgsExpr}];
      return ${targetName}(...parsedInput);
      `
    );

    const noop = () => "";
    const value = runner(noop, noop);
    return { value };
  } catch (err: unknown) {
    return {
      value: undefined,
      error: err instanceof Error ? err.message : "Python evaluation error.",
    };
  }
}
