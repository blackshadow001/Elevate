// Real lightweight in-browser SQL engine supporting SELECT, JOIN, WHERE, GROUP BY, ORDER BY, LIMIT, and aggregates

export type SqlRow = Record<string, string | number | boolean | null>;
export type SqlDatabase = Record<string, SqlRow[]>;

export interface SqlExecutionResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
}

function splitTopLevelCommas(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let current = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      else if (ch === "," && depth === 0) {
        parts.push(current.trim());
        current = "";
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function stripQuotes(val: string): string {
  const t = val.trim();
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1);
  }
  return t;
}

function resolveField(row: SqlRow, fieldExpr: string): string | number | boolean | null {
  const clean = fieldExpr.trim();
  if (clean in row) return row[clean];
  // Match unqualified or alias-qualified field (e.g. e.salary -> salary or e.salary)
  const dotIdx = clean.indexOf(".");
  if (dotIdx !== -1) {
    if (clean in row) return row[clean];
    const col = clean.slice(dotIdx + 1);
    if (col in row) return row[col];
  }
  // Literal numeric or string
  if ((clean.startsWith("'") && clean.endsWith("'")) || (clean.startsWith('"') && clean.endsWith('"'))) {
    return clean.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(clean)) return Number(clean);
  return undefined as unknown as null;
}

function evaluateCondition(row: SqlRow, conditionStr: string): boolean {
  // Split OR at top level first
  const orParts = conditionStr.split(/\s+or\s+/i);
  if (orParts.length > 1) {
    return orParts.some((part) => evaluateCondition(row, part));
  }

  // Split AND at top level
  const andParts = conditionStr.split(/\s+and\s+/i);
  if (andParts.length > 1) {
    return andParts.every((part) => evaluateCondition(row, part));
  }

  const expr = conditionStr.trim().replace(/^\((.*)\)$/, "$1").trim();

  // IN (...)
  const inMatch = expr.match(/^([a-zA-Z0-9_.]+)\s+(not\s+)?in\s*\(([^)]+)\)$/i);
  if (inMatch) {
    const val = resolveField(row, inMatch[1]);
    const isNot = Boolean(inMatch[2]);
    const items = splitTopLevelCommas(inMatch[3]).map((x) => {
      const s = stripQuotes(x);
      return /^-?\d+(\.\d+)?$/.test(x.trim()) ? Number(x.trim()) : s.toLowerCase();
    });
    const normVal = typeof val === "number" ? val : String(val ?? "").toLowerCase();
    const matched = items.includes(normVal);
    return isNot ? !matched : matched;
  }

  // LIKE
  const likeMatch = expr.match(/^([a-zA-Z0-9_.]+)\s+(not\s+)?like\s+(['"].*['"])$/i);
  if (likeMatch) {
    const val = String(resolveField(row, likeMatch[1]) ?? "");
    const isNot = Boolean(likeMatch[2]);
    const pattern = stripQuotes(likeMatch[3])
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/%/g, ".*")
      .replace(/_/g, ".");
    const matched = new RegExp(`^${pattern}$`, "i").test(val);
    return isNot ? !matched : matched;
  }

  // IS NULL / IS NOT NULL
  const nullMatch = expr.match(/^([a-zA-Z0-9_.]+)\s+is\s+(not\s+)?null$/i);
  if (nullMatch) {
    const val = resolveField(row, nullMatch[1]);
    const isNot = Boolean(nullMatch[2]);
    return isNot ? val !== null && val !== undefined : val === null || val === undefined;
  }

  // Binary comparison
  const cmpMatch = expr.match(/^([a-zA-Z0-9_.]+)\s*(>=|<=|!=|<>|=|>|<)\s*(.+)$/);
  if (!cmpMatch) {
    throw new Error(`Invalid WHERE condition near "${expr}".`);
  }

  const leftVal = resolveField(row, cmpMatch[1]);
  if (leftVal === undefined) {
    throw new Error(`Unknown column "${cmpMatch[1]}" in WHERE clause.`);
  }
  const op = cmpMatch[2];
  const rawRight = cmpMatch[3].trim();
  const rightVal =
    (rawRight.startsWith("'") && rawRight.endsWith("'")) || (rawRight.startsWith('"') && rawRight.endsWith('"'))
      ? stripQuotes(rawRight)
      : /^-?\d+(\.\d+)?$/.test(rawRight)
      ? Number(rawRight)
      : resolveField(row, rawRight);

  if (op === "=") return leftVal == rightVal;
  if (op === "!=" || op === "<>") return leftVal != rightVal;
  if (op === ">") return Number(leftVal) > Number(rightVal);
  if (op === "<") return Number(leftVal) < Number(rightVal);
  if (op === ">=") return Number(leftVal) >= Number(rightVal);
  if (op === "<=") return Number(leftVal) <= Number(rightVal);
  return false;
}

function evaluateAggregateExpr(groupRows: SqlRow[], expr: string): string | number | null {
  const clean = expr.trim();
  const roundMatch = clean.match(/^round\s*\((.+),\s*(\d+)\s*\)$/i);
  if (roundMatch) {
    const inner = evaluateAggregateExpr(groupRows, roundMatch[1]);
    const decimals = Number(roundMatch[2]);
    if (typeof inner === "number") {
      return Number(inner.toFixed(decimals));
    }
    return inner;
  }

  const aggMatch = clean.match(/^(count|sum|avg|min|max)\s*\(\s*(.+?)\s*\)$/i);
  if (aggMatch) {
    const fn = aggMatch[1].toLowerCase();
    const arg = aggMatch[2].trim();
    if (fn === "count") {
      if (arg === "*") return groupRows.length;
      return groupRows.filter((r) => resolveField(r, arg) !== null && resolveField(r, arg) !== undefined).length;
    }
    const nums = groupRows
      .map((r) => Number(resolveField(r, arg)))
      .filter((n) => !Number.isNaN(n));
    if (nums.length === 0) return 0;
    if (fn === "sum") return nums.reduce((a, b) => a + b, 0);
    if (fn === "avg") return Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
    if (fn === "min") return Math.min(...nums);
    if (fn === "max") return Math.max(...nums);
  }

  // Non-aggregate field on first row of group
  const val = resolveField(groupRows[0], clean);
  if (val === undefined) {
    throw new Error(`Unknown column or expression "${clean}" in SELECT list.`);
  }
  return typeof val === "boolean" ? String(val) : val;
}

export function executeSqlQuery(rawSql: string, db: SqlDatabase): SqlExecutionResult {
  const sql = rawSql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim()
    .replace(/;+\s*$/, "")
    .replace(/\s+/g, " ");

  if (!sql) {
    throw new Error("Empty query. Write a SELECT statement to query the schema.");
  }

  const selectMatch = sql.match(/^select\s+(.+?)\s+from\s+(.+)$/i);
  if (!selectMatch) {
    throw new Error("SQL Syntax Error: Expected 'SELECT <columns> FROM <table> ...'.");
  }

  const selectClause = selectMatch[1].trim();
  let remainder = selectMatch[2].trim();

  // Extract optional LIMIT
  let limitCount: number | null = null;
  const limitMatch = remainder.match(/\s+limit\s+(\d+)$/i);
  if (limitMatch) {
    limitCount = Number(limitMatch[1]);
    remainder = remainder.slice(0, limitMatch.index).trim();
  }

  // Extract optional ORDER BY
  let orderByClause: string | null = null;
  const orderMatch = remainder.match(/\s+order\s+by\s+(.+)$/i);
  if (orderMatch) {
    orderByClause = orderMatch[1].trim();
    remainder = remainder.slice(0, orderMatch.index).trim();
  }

  // Extract optional GROUP BY (and HAVING)
  let groupByClause: string | null = null;
  let havingClause: string | null = null;
  const groupMatch = remainder.match(/\s+group\s+by\s+(.+)$/i);
  if (groupMatch) {
    let gbPart = groupMatch[1].trim();
    const havingMatch = gbPart.match(/\s+having\s+(.+)$/i);
    if (havingMatch) {
      havingClause = havingMatch[1].trim();
      gbPart = gbPart.slice(0, havingMatch.index).trim();
    }
    groupByClause = gbPart;
    remainder = remainder.slice(0, groupMatch.index).trim();
  }

  // Extract optional WHERE
  let whereClause: string | null = null;
  const whereMatch = remainder.match(/\s+where\s+(.+)$/i);
  if (whereMatch) {
    whereClause = whereMatch[1].trim();
    remainder = remainder.slice(0, whereMatch.index).trim();
  }

  // Parse FROM + optional JOINs
  const joinSplit = remainder.split(/\s+(?:(inner|left)\s+)?join\s+/i);
  const baseFrom = joinSplit[0].trim();
  const baseParts = baseFrom.split(/\s+(?:as\s+)?/i);
  const baseTableName = baseParts[0].toLowerCase();
  const baseAlias = (baseParts[1] || baseTableName).toLowerCase();

  const baseData = db[baseTableName];
  if (!baseData) {
    throw new Error(`Table "${baseTableName}" does not exist. Available tables: ${Object.keys(db).join(", ")}.`);
  }

  // Prefix rows with alias and keep unqualified keys where unambiguous
  let workingRows: SqlRow[] = baseData.map((row) => {
    const r: SqlRow = { ...row };
    for (const k of Object.keys(row)) {
      r[`${baseAlias}.${k}`] = row[k];
    }
    return r;
  });

  // Process JOINs (pattern after split: every 2 entries after index 0 because of capturing group (inner|left))
  for (let i = 1; i < joinSplit.length; i += 2) {
    const joinType = (joinSplit[i] || "inner").toLowerCase();
    const joinSpec = joinSplit[i + 1];
    const onMatch = joinSpec.match(/^([a-zA-Z0-9_]+)(?:\s+(?:as\s+)?([a-zA-Z0-9_]+))?\s+on\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)$/i);
    if (!onMatch) {
      throw new Error(`Invalid JOIN syntax near "${joinSpec}". Expected 'JOIN <table> [alias] ON <col1> = <col2>'.`);
    }
    const joinTable = onMatch[1].toLowerCase();
    const joinAlias = (onMatch[2] || joinTable).toLowerCase();
    const onLeft = onMatch[3];
    const onRight = onMatch[4];

    const joinData = db[joinTable];
    if (!joinData) {
      throw new Error(`Joined table "${joinTable}" does not exist.`);
    }

    const joinedRows: SqlRow[] = [];
    for (const leftRow of workingRows) {
      let matchedAny = false;
      for (const rightRow of joinData) {
        const candidate: SqlRow = { ...leftRow };
        for (const k of Object.keys(rightRow)) {
          if (!(k in candidate)) candidate[k] = rightRow[k];
          candidate[`${joinAlias}.${k}`] = rightRow[k];
        }
        const v1 = resolveField(candidate, onLeft);
        const v2 = resolveField(candidate, onRight);
        if (v1 !== undefined && v2 !== undefined && v1 == v2) {
          joinedRows.push(candidate);
          matchedAny = true;
        }
      }
      if (!matchedAny && joinType === "left") {
        const padded: SqlRow = { ...leftRow };
        if (joinData[0]) {
          for (const k of Object.keys(joinData[0])) {
            padded[`${joinAlias}.${k}`] = null;
          }
        }
        joinedRows.push(padded);
      }
    }
    workingRows = joinedRows;
  }

  // Apply WHERE filter
  if (whereClause) {
    workingRows = workingRows.filter((row) => evaluateCondition(row, whereClause!));
  }

  // Parse SELECT list
  const rawSelectCols = splitTopLevelCommas(selectClause);
  const hasAggregates = rawSelectCols.some((c) => /\b(count|sum|avg|min|max)\s*\(/i.test(c));

  const parsedCols = rawSelectCols.map((colExpr) => {
    const aliasMatch = colExpr.match(/^(.+?)\s+as\s+([a-zA-Z0-9_]+)$/i);
    if (aliasMatch) {
      return { expr: aliasMatch[1].trim(), label: aliasMatch[2].trim() };
    }
    const dotIdx = colExpr.indexOf(".");
    const cleanLabel = dotIdx !== -1 && !colExpr.includes("(") ? colExpr.slice(dotIdx + 1) : colExpr.trim();
    return { expr: colExpr.trim(), label: cleanLabel };
  });

  let resultObjects: SqlRow[] = [];
  let outputColumns: string[] = [];

  if (groupByClause || hasAggregates) {
    const groupCols = groupByClause ? splitTopLevelCommas(groupByClause) : [];
    const groups = new Map<string, SqlRow[]>();

    if (groupCols.length === 0) {
      groups.set("__all__", workingRows);
    } else {
      for (const row of workingRows) {
        const keyParts = groupCols.map((gc) => String(resolveField(row, gc) ?? "NULL"));
        const key = keyParts.join("||");
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
      }
    }

    outputColumns = parsedCols.map((c) => c.label);
    for (const groupRows of groups.values()) {
      if (groupRows.length === 0 && groupCols.length > 0) continue;
      const outObj: SqlRow = {};
      for (const col of parsedCols) {
        outObj[col.label] = groupRows.length === 0 ? 0 : evaluateAggregateExpr(groupRows, col.expr);
      }
      if (havingClause && !evaluateCondition(outObj, havingClause)) {
        continue;
      }
      resultObjects.push(outObj);
    }
  } else {
    if (parsedCols.length === 1 && parsedCols[0].expr === "*") {
      const sampleKeys = baseData[0] ? Object.keys(baseData[0]) : [];
      // If joined, collect unique clean keys
      const allCleanKeys = new Set<string>(sampleKeys);
      if (workingRows[0]) {
        for (const k of Object.keys(workingRows[0])) {
          if (!k.includes(".")) allCleanKeys.add(k);
        }
      }
      outputColumns = Array.from(allCleanKeys);
      resultObjects = workingRows.map((row) => {
        const outObj: SqlRow = {};
        for (const k of outputColumns) {
          outObj[k] = row[k] ?? null;
        }
        return outObj;
      });
    } else {
      outputColumns = parsedCols.map((c) => c.label);
      resultObjects = workingRows.map((row) => {
        const outObj: SqlRow = {};
        for (const col of parsedCols) {
          const val = resolveField(row, col.expr);
          if (val === undefined) {
            throw new Error(`Unknown column "${col.expr}" in SELECT clause.`);
          }
          outObj[col.label] = val;
        }
        return outObj;
      });
    }
  }

  // Apply ORDER BY
  if (orderByClause) {
    const orderItems = splitTopLevelCommas(orderByClause).map((item) => {
      const m = item.match(/^(.+?)(?:\s+(asc|desc))?$/i);
      return {
        field: m ? m[1].trim() : item.trim(),
        desc: m?.[2]?.toLowerCase() === "desc",
      };
    });

    resultObjects.sort((a, b) => {
      for (const { field, desc } of orderItems) {
        const va = resolveField(a, field);
        const vb = resolveField(b, field);
        let cmp = 0;
        if (typeof va === "number" && typeof vb === "number") {
          cmp = va - vb;
        } else {
          cmp = String(va ?? "").localeCompare(String(vb ?? ""));
        }
        if (cmp !== 0) return desc ? -cmp : cmp;
      }
      return 0;
    });
  }

  // Apply LIMIT
  if (limitCount !== null) {
    resultObjects = resultObjects.slice(0, Math.max(0, limitCount));
  }

  return {
    columns: outputColumns,
    rows: resultObjects.map((obj) => outputColumns.map((col) => obj[col] ?? null)),
  };
}
