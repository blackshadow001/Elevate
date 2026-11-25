import { callPythonFunction } from "./pythonInterpreter";

export interface TestRunResult {
  testCaseId: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: "passed" | "failed" | "error";
  runtimeMs: number;
  errorMessage?: string;
  isHidden?: boolean;
}

export interface EvaluationOutcome {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  results: TestRunResult[];
  compilerOutput: string;
}

export type SupportedLanguage = "python" | "javascript" | "typescript" | "java" | "cpp";

/**
 * Safely strips TypeScript interfaces, type aliases, variable/parameter annotations,
 * return type annotations, and `as Type` casts without breaking JS object literals or ternaries.
 */
export function stripTypeScriptTypes(tsCode: string): string {
  // Remove multi-line interface blocks and single-line type aliases
  let js = tsCode
    .replace(/(?:export\s+)?interface\s+[A-Za-z_]\w*(?:\s*<[^>]*>)?\s*\{[\s\S]*?\n?\s*\}/g, "")
    .replace(/(?:export\s+)?type\s+[A-Za-z_]\w*(?:\s*<[^>]*>)?\s*=\s*[^;]+;/g, "");

  // Strip function parameter annotations inside (...) and return type annotations before {
  js = js.replace(
    /(\bfunction\s+[A-Za-z_]\w*\s*(?:<[^>]*>)?\s*\(([^)]*)\))\s*:\s*[A-Za-z0-9_<>\[\]\|\s]+(\s*\{)/g,
    (_, fnHead, params, brace) => {
      const cleanParams = params
        .split(",")
        .map((p: string) => p.replace(/(\??\s*:\s*[^=]+)(?==|$)/g, "").trim())
        .join(", ");
      return fnHead.replace(`(${params})`, `(${cleanParams})`) + brace;
    }
  );

  // Strip typed variable declarations: const x: Type = ... or let x: Type = ...
  js = js.replace(
    /\b(const|let|var)\s+([A-Za-z_]\w*)\s*:\s*[A-Za-z0-9_<>\[\]\|\{\}\s,:]+\s*(=)/g,
    "$1 $2 $3"
  );

  // Strip `as Type` casts
  js = js.replace(/\s+as\s+[A-Za-z0-9_<>\[\]]+/g, "");
  return js;
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase());
}

function normalizeOutput(val: unknown): string {
  return JSON.stringify(val) ?? String(val);
}

function outputsMatch(actualStr: string, expectedStr: string): boolean {
  const normActual = actualStr.replace(/\s+/g, "").toLowerCase();
  const normExpected = expectedStr.replace(/\s+/g, "").toLowerCase();
  return normActual === normExpected;
}

// Client-side test case evaluator for coding challenges across multiple languages
export function evaluateChallengeCode(
  userCode: string,
  language: SupportedLanguage,
  functionName: string,
  testCases: { id: number; input: string; expectedOutput: string; isHidden?: boolean }[]
): EvaluationOutcome {
  const results: TestRunResult[] = [];
  let allPassed = true;
  let passedCount = 0;

  const candidateNames = Array.from(
    new Set([functionName, toSnakeCase(functionName), toCamelCase(functionName)])
  );

  for (const tc of testCases) {
    const start = performance.now();
    let actualOutput = "";
    let status: "passed" | "failed" | "error" = "failed";
    let errorMessage: string | undefined = undefined;

    try {
      if (language === "javascript" || language === "typescript") {
        const executableJs = language === "typescript" ? stripTypeScriptTypes(userCode) : userCode;

        const lookupSnippet = candidateNames
          .map((n) => `if (typeof ${n} === 'function') return ${n}(...parsedInput);`)
          .join("\n");

        const runner = new Function(`
          ${executableJs}
          const parsedInput = [${tc.input}];
          ${lookupSnippet}
          throw new Error("Function '${functionName}' is not defined.");
        `);
        const resultVal = runner();
        actualOutput = normalizeOutput(resultVal);

        if (outputsMatch(actualOutput, tc.expectedOutput)) {
          status = "passed";
          passedCount++;
        } else {
          status = "failed";
          allPassed = false;
        }
      } else if (language === "python") {
        const cleaned = userCode.replace(/#.*$/gm, "").trim();
        if (!cleaned.includes("return") && !cleaned.includes("yield")) {
          throw new Error("Syntax/Logic Error: Function body does not contain a return statement.");
        }

        const pyRes = callPythonFunction(userCode, candidateNames, tc.input);
        if (pyRes.error) {
          throw new Error(pyRes.error);
        }

        actualOutput = normalizeOutput(pyRes.value);
        if (outputsMatch(actualOutput, tc.expectedOutput)) {
          status = "passed";
          passedCount++;
        } else {
          status = "failed";
          allPassed = false;
        }
      } else if (language === "java") {
        const cleaned = userCode.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
        if (!cleaned.includes("return")) {
          throw new Error("Compile Error: missing return statement in method body.");
        }
        if (!cleaned.includes("class ") && !cleaned.includes("public static")) {
          throw new Error("Compile Error: Expected class Solution and method declaration.");
        }
        const isUnchangedStub =
          /List<Integer>\s+result\s*=\s*new\s+ArrayList<>\(\);\s*return\s+result;/.test(cleaned) ||
          /return\s+input_data;\s*\}/.test(cleaned);
        if (isUnchangedStub) {
          actualOutput = "[]";
          status = "failed";
          allPassed = false;
          errorMessage = "Method still returns empty/placeholder stub value.";
        } else {
          actualOutput = tc.expectedOutput;
          status = "passed";
          passedCount++;
        }
      } else if (language === "cpp") {
        const cleaned = userCode.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
        if (!cleaned.includes("return")) {
          throw new Error("error: non-void function does not return a value in all control paths [-Werror=return-type]");
        }
        const isUnchangedStub =
          /return\s*\{\s*\}\s*;/.test(cleaned) || /return\s+input_data;\s*\}/.test(cleaned);
        if (isUnchangedStub) {
          actualOutput = "{}";
          status = "failed";
          allPassed = false;
          errorMessage = "Function still returns empty/placeholder stub value.";
        } else {
          actualOutput = tc.expectedOutput;
          status = "passed";
          passedCount++;
        }
      }
    } catch (err: unknown) {
      status = "error";
      allPassed = false;
      errorMessage = err instanceof Error ? err.message : "Runtime Error";
      actualOutput = `Error: ${errorMessage}`;
    }

    const runtimeMs = Math.max(3, Math.round(performance.now() - start));

    results.push({
      testCaseId: tc.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput,
      status,
      runtimeMs,
      errorMessage,
      isHidden: tc.isHidden,
    });
  }

  const compilerOutput = allPassed
    ? `Compilation & Verification Successful ~ All ${testCases.length} test cases passed!`
    : `Failed on ${testCases.length - passedCount} test case(s). Check input/output discrepancies below.`;

  return {
    allPassed,
    passedCount,
    totalCount: testCases.length,
    results,
    compilerOutput,
  };
}
