import { JSON } from "..";
import { backSlashCode, quoteCode } from "../src/chars";
import { parseJSONInt, unsafeCharCodeAt } from "../src/util";
import { HASH } from "util/hash";

@json
class Vec3 {
  x: i32;
  y: i32;
  z: i32;

  /*@inline __JSON_Serialize(data: Vec3): string {
    return `{"x":${data.x.toString()},"y":${data.y.toString()},"z":${data.z.toString()}}`;
  }*/

  @inline __JSON_Deserialize(data: string, to: Vec3): Vec3 {
    let last = 1;
    let char = 0;
    let inStr = false;
    let key: string | null = null;
    let pos = 0;
    for (; pos < data.length - 1; pos++) {
      char = unsafeCharCodeAt(data, pos);
      if (inStr === false && char === quoteCode) {
        if (key != null) {
          if (unsafeCharCodeAt(key, 0) == 120) {
            to.x = parseJSONInt<i32>(data.substring(last, pos - 1))
          } else if (unsafeCharCodeAt(key, 0) == 121) {
            to.y = parseJSONInt<i32>(data.substring(last, pos - 1))
          } else if (unsafeCharCodeAt(key, 0) == 122) {
            to.z = parseJSONInt<i32>(data.substring(last, pos - 1))
          }
        }
        last = ++pos;
        inStr = true;
      } else if (char === quoteCode && unsafeCharCodeAt(data, pos - 1) != backSlashCode) {
        inStr = false;
        key = data.substring(last, pos);
        last = pos += 2;
      }
    }
    if (key != null) {
      if (unsafeCharCodeAt(key, 0) == 120) {
        to.x = parseJSONInt<i32>(data.substring(last, pos - 1))
      } else if (unsafeCharCodeAt(key, 0) == 121) {
        to.y = parseJSONInt<i32>(data.substring(last, pos - 1))
      } else if (unsafeCharCodeAt(key, 0) == 122) {
        to.z = parseJSONInt<i32>(data.substring(last, pos - 1))
      }
    }
    return to;
  }
}

const vec: Vec3 = {
  x: 3,
  y: 1,
  z: 8
};

const vecOut = new Vec3();

const i32Max = blackbox("429496729");
/*
bench("Stringify Object (Vec3)", () => {
  blackbox<string>(vec.__JSON_Serialize(vec));
});*/

bench("HASH String", () => {
  blackbox<number>(HASH("Hello"));
})
// TODO: Make this allocate without crashing
bench("Parse Object (Vec3)", () => {
  blackbox<Vec3>(vec.__JSON_Deserialize('{"x":0,"y":0,"z":0}', vec));
});

bench("Stringify Number Array", () => {
  blackbox(JSON.stringify<i32[]>([1, 2, 3]));
});

bench("Parse Array", () => {
  blackbox(JSON.parse<i32[]>(blackbox("[1,2,3]")));
});

bench("Stringify Boolean Array", () => {
  blackbox(JSON.stringify<boolean[]>([true, false, true]));
});

bench("Stringify String Array", () => {
  blackbox(JSON.stringify<string[]>(["a", "b", "c"]));
});

bench("Stringify String", () => {
  blackbox(JSON.stringify(blackbox("Hello \"World!")));
});

bench("Parse String", () => {
  blackbox(JSON.parse<string>(blackbox('"Hello \"World!"')));
});

bench("Stringify Boolean", () => {
  blackbox(JSON.stringify(blackbox(true)));
});

bench("Parse Boolean", () => {
  blackbox(JSON.parse<boolean>(blackbox("true")));
});

bench("Stringify Integer", () => {
  blackbox(JSON.stringify(blackbox(314)));
});

bench("Parse Integer", () => {
  blackbox(JSON.parse<i32>(blackbox("314")));
});

bench("Stringify Float", () => {
  blackbox(JSON.stringify(blackbox(3.14)));
});

bench("Parse Float", () => {
  blackbox(JSON.parse<f32>(blackbox("3.14")));
});