import { StringSink } from "as-string-sink/assembly";
import { CharCode, isSpace } from "util/string";
import { backSlashCode, quoteCode, rCode } from "./chars";
import { tally as BigInt } from "as-tally/assembly";

// @ts-ignore
@inline
export function isBigNum<T>(): boolean {
  if (idof<T>() == idof<BigInt>()) return true;
  return false;
}

// @ts-ignore
@inline
export function unsafeCharCodeAt(data: string, pos: i32): i32 {
  return load<u16>(changetype<usize>(data) + ((<usize>pos) << 1));
}

export function removeWhitespace(data: string): string {
  const result = new StringSink();
  let instr = false;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    if (instr === false && char === quoteCode) instr = true;
    else if (
      instr === true &&
      char === quoteCode &&
      data.charCodeAt(i - 1) !== backSlashCode
    )
      instr = false;

    if (instr === false) {
      if (!isSpace(char)) result.write(data.charAt(i));
    } else {
      result.write(data.charAt(i));
    }
  }
  return result.toString();
}

// @ts-ignore
@inline
export function escapeChar(char: string): string {
  switch (unsafeCharCodeAt(char, 0)) {
    case 0x22: return '\\"';
    case 0x5C: return "\\\\";
    case 0x08: return "\\b";
    case 0x0A: return "\\n";
    case 0x0D: return "\\r";
    case 0x09: return "\\t";
    case 0x0C: return "\\f";
    case 0x0B: return "\\u000b";
    default: return char;
  }
}

/**
 * A terrible function which finds the depth of a certain array.
 * Suffers no overhead besides function calling and a if/else.
 * @returns depth of array
 */
export function getArrayDepth<T>(depth: i32 = 1): i32 {
  // @ts-ignore
  if (!isArray<T>()) {
    return 0;
    // @ts-ignore
  } else if (isArray<valueof<T>>()) {
    depth++;
    // @ts-ignore
    return getArrayDepth<valueof<T>>(depth);
  } else {
    return depth;
  }
}

/**
 * Implementation of ATOI. Can be much much faster with SIMD.
 * Its pretty fast. (173m ops (atoi_fast) vs 89 ops (parseInt))
*/
@unsafe
@inline
export function atoi_fast<T extends number>(str: string, offset: i32 = 0): T {
  // @ts-ignore
  let val: T = 0;
  for (; offset < (str.length << 1); offset += 2) {
    let _char: u16 = load<u16>(changetype<usize>(str) + <usize>offset)
    let char: u8 = u8(_char);
    // @ts-ignore
    val = (val << 1) + (val << 3) + (char - 48);
    // We use load because in this case, there is no need to have bounds-checking
  }
  return val;
}

/**
 * Implementation of ATOI. Can be much much faster with SIMD.
 * Its pretty fast. (173m ops (atoi_fast) vs 89 ops (parseInt))
*/
@unsafe
@inline
export function parseJSONInt<T extends number>(str: string): T {
  // @ts-ignore
  let val: T = 0;
  let _char: u16 = load<u16>(changetype<usize>(str));
  let char: u8 = u8(_char);
  let pos = 2;
  let neg = char === 45;
  // @ts-ignore
  val = (val << 1) + (val << 3) + (char - 48);
  for (; pos < (str.length << 1); pos += 2) {
    _char = load<u16>(changetype<usize>(str) + <usize>pos);
    char = u8(_char);
    if (char === 101 || char === 69) {
      _char = load<u16>(changetype<usize>(str) + <usize>(pos += 2));
      char = u8(_char);
      if (char === 45) {
        // @ts-ignore
        val /= sciNote<T>(atoi_fast<T>(str, pos += 2));
        if (neg === true) {
          // @ts-ignore
          return ~val + 1;
        }
        return val;
      } else {
        // @ts-ignore
        val *= sciNote<T>(atoi_fast<T>(str, pos += 2));
        if (neg === true) {
          // @ts-ignore
          return ~val + 1;
        }
        return val;
      }
    }
    // @ts-ignore
    val = (val << 1) + (val << 3) + (char - 48);
  }
  if (neg === true) {
    // @ts-ignore
    val = ~val + 1;
  }
  return val;
}

function sciNote<T extends number>(num: T): T {
  // @ts-ignore
  let res: T = 1;
  if (num > 0) {
    for (let i: u64 = 0; i < u64(num); i++) {
      // @ts-ignore
      res *= 10;
    }
  } else {
    for (let i: u64 = 0; i < u64(num); i++) {
      // @ts-ignore
      res /= 10;
    }
  }
  // @ts-ignore
  return res;
}
