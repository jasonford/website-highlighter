class y {
  /**
   * Calculates the Levenshtein distance for all substrings and returns their
   * distance and insertion-deletion offset.
   * 
   * @param {string} needle The search string.
   * @param {string} haystack The string to search.
   * 
   * @return {array} Array of all substring matches in pairs [distance, offset]
   */
  getEditDistances(e, t) {
    var n = new Array(t.length + 1).fill([0, 0]);
    for (let s = 0; s < e.length; s++) {
      let l = [[s + 1, 0]];
      for (let o = 0; o < t.length; o++) {
        let r = e[s] != t[o], a = n[o + 1][0] + 1, h = l[o][0] + 1, d = n[o][0] + r, u = Math.min(a, Math.min(h, d)), c = [u, n[o][1]];
        a === u ? c[1] = n[o + 1][1] - 1 : h === u && (c[1] = l[o][1] + 1), l.push(c);
      }
      n = l;
    }
    return n;
  }
  /**
   * Search haystack for all instances of needle and returns an array of
   * objects containing string position and levenshtein distance.
   * 
   * @param {string} needle The search string.
   * @param {string} haystack The string to search.
   * 
   * @return {array} Array of best substring matches.
   */
  getMatches(e, t) {
    let n = this.getEditDistances(e, t), s = [0], l = n[0][0];
    for (let r = 1; r < n.length; r++) {
      let a = n[r][0];
      a < l ? (s = [r], l = a) : a == l && s.push(r);
    }
    let o = [];
    for (let r of s) {
      let a = n[r], h = {
        distance: a[0],
        start: r - e.length - a[1],
        //simplification of startPos = endPos − (needleLength + insertions − deletions)
        end: r
      };
      o.push(h);
    }
    return o;
  }
}
function I(i, e) {
  return new y().getMatches(i, e);
}
function M(i, e) {
  const t = I(i, e);
  let n;
  for (const r of t)
    (n === void 0 || r.distance < n.distance) && (n = r);
  const s = Math.max(n.start, 0), l = Math.min(Math.max(n.end, s), e.length);
  return { value: e.slice(s, l), start: s, end: l, distance: n.distance };
}
function T(i, e, t) {
  const n = i.textContent ?? "";
  if (!Number.isInteger(e) || !Number.isInteger(t) || e < 0 || e >= t || t > n.length)
    throw new RangeError(
      `Invalid range [${e}, ${t}) for text length ${n.length}`
    );
  const s = i.ownerDocument, l = s.createTreeWalker(
    i,
    s.defaultView.NodeFilter.SHOW_TEXT
  );
  let o = 0, r = null, a = 0, h = null, d = 0;
  for (let c = l.nextNode(); c; c = l.nextNode()) {
    const g = o + c.data.length;
    if (r === null && e >= o && e < g && (r = c, a = e - o), h === null && t > o && t <= g && (h = c, d = t - o), r && h)
      break;
    o = g;
  }
  if (!r || !h)
    throw new Error(
      "Could not map offsets to the DOM. The DOM may have changed."
    );
  const u = s.createRange();
  return u.setStart(r, a), u.setEnd(h, d), u;
}
const f = "website-highlighter", w = `${f}:response`, m = 500;
let H = 0;
function S(i) {
  return new Promise((e) => globalThis.setTimeout(e, i));
}
function b(i, e, t) {
  const n = Math.max(i.length, e.length);
  return n === 0 ? 1 : (n - t) / n;
}
function p(i, e) {
  const t = e.textContent ?? "", { start: n, end: s, value: l, distance: o } = M(i, t), r = e.ownerDocument?.defaultView ?? window;
  if (!r.CSS?.highlights || !r.Highlight) throw new Error("This browser does not support the CSS Custom Highlight API.");
  return {
    haystack: t,
    range: n < s ? T(e, n, s) : null,
    value: l,
    view: r,
    score: b(i, l, o)
  };
}
function E({ range: i, value: e, view: t }) {
  if (!i) throw new Error("Could not find text to highlight.");
  return t.CSS.highlights.set(f, new t.Highlight(i)), { range: i, value: e };
}
async function x(i, e, t, n, s) {
  let l = 0;
  for (; ; ) {
    const o = p(i, e);
    if (o.score >= t) return E(o);
    for (; l < n && (await S(s), l += 1, (e.textContent ?? "") === o.haystack); )
      ;
    if (l >= n) throw new Error(`Could not find "${i}" with threshold ${t}. Best match was "${o.value}".`);
  }
}
function C(i, {
  root: e = document.body,
  threshold: t = 0,
  retries: n = 6,
  retryInterval: s = m
} = {}) {
  return t > 0 ? x(i, e, t, n, s) : E(p(i, e));
}
function N(i, e, t = "*") {
  if (!i?.contentWindow) throw new TypeError("Expected an iframe with a contentWindow");
  const n = `${Date.now()}-${H++}`, s = i.contentWindow;
  let l;
  function o() {
    s.postMessage({
      type: f,
      id: n,
      text: e
    }, t);
  }
  function r(a) {
    a.source === s && a.data?.type === w && a.data.id === n && (window.clearInterval(l), window.removeEventListener("message", r));
  }
  window.addEventListener("message", r), o(), l = window.setInterval(o, m);
}
if (typeof window < "u") {
  let i = function(t) {
    return t.origin === "null" ? "*" : t.origin;
  }, e = function(t) {
    t.source?.postMessage({
      type: w,
      id: t.data.id
    }, i(t));
  };
  window.addEventListener("message", (t) => {
    t.data?.type === f && (e(t), C(t.data.text, { threshold: 0.9 }).catch((n) => console.error(n)));
  });
}
export {
  C as default,
  N as highlightInIframe
};
