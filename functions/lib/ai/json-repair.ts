// Lenient JSON parsing for LLM output.
// Models occasionally return almost-valid JSON: wrapped in ``` fences, with
// prose around it, a trailing comma, or a missing closing bracket
// (e.g. an array closed with `}` instead of `]}`). This tries a strict parse
// first, then repairs bracket structure and retries.

export function parseLooseJson(content: string): any {
  let text = content.trim();

  // Strip ```json fences
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  }

  // Drop any prose before the first object/array
  const start = text.search(/[{[]/);
  if (start > 0) text = text.slice(start);

  try {
    return JSON.parse(text);
  } catch (strictError) {
    const repaired = repairJsonStructure(text);
    try {
      return JSON.parse(repaired);
    } catch {
      throw strictError;
    }
  }
}

// Walk the text outside of strings, keep a stack of open brackets, and:
// - when a closer doesn't match the top of the stack, emit the missing closers first
// - drop closers that match nothing
// - stop after the top-level value closes (ignores trailing prose)
// - at the end, close an unterminated string and any open brackets
// - remove trailing commas before a closer
export function repairJsonStructure(text: string): string {
  const out: string[] = [];
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      out.push(ch);
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      out.push(ch);
    } else if (ch === '{' || ch === '[') {
      stack.push(ch === '{' ? '}' : ']');
      out.push(ch);
    } else if (ch === '}' || ch === ']') {
      if (!stack.includes(ch)) continue; // stray closer
      while (stack.length && stack[stack.length - 1] !== ch) {
        dropTrailingComma(out);
        out.push(stack.pop()!);
      }
      dropTrailingComma(out);
      out.push(stack.pop()!);
      if (stack.length === 0) break; // top-level value done
    } else {
      out.push(ch);
    }
  }

  if (inString) out.push('"');
  while (stack.length) {
    dropTrailingComma(out);
    out.push(stack.pop()!);
  }

  return out.join('');
}

// Remove a comma (and whitespace after it) at the end of the output buffer.
function dropTrailingComma(out: string[]): void {
  let j = out.length - 1;
  while (j >= 0 && /\s/.test(out[j])) j--;
  if (j >= 0 && out[j] === ',') out.splice(j);
}
