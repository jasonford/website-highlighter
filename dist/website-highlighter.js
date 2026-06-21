class M {
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
    for (let r = 0; r < e.length; r++) {
      let a = [[r + 1, 0]];
      for (let o = 0; o < t.length; o++) {
        let s = e[r] != t[o], l = n[o + 1][0] + 1, c = a[o][0] + 1, d = n[o][0] + s, u = Math.min(l, Math.min(c, d)), h = [u, n[o][1]];
        l === u ? h[1] = n[o + 1][1] - 1 : c === u && (h[1] = a[o][1] + 1), a.push(h);
      }
      n = a;
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
    let n = this.getEditDistances(e, t), r = [0], a = n[0][0];
    for (let s = 1; s < n.length; s++) {
      let l = n[s][0];
      l < a ? (r = [s], a = l) : l == a && r.push(s);
    }
    let o = [];
    for (let s of r) {
      let l = n[s], c = {
        distance: l[0],
        start: s - e.length - l[1],
        //simplification of startPos = endPos − (needleLength + insertions − deletions)
        end: s
      };
      o.push(c);
    }
    return o;
  }
}
function T(i, e) {
  return new M().getMatches(i, e);
}
function b(i, e) {
  const t = T(i, e);
  let n;
  for (const s of t)
    (n === void 0 || s.distance < n.distance) && (n = s);
  const r = Math.max(n.start, 0), a = Math.min(Math.max(n.end, r), e.length);
  return { value: e.slice(r, a), start: r, end: a, distance: n.distance };
}
function I(i, e, t) {
  const n = i.textContent ?? "";
  if (!Number.isInteger(e) || !Number.isInteger(t) || e < 0 || e >= t || t > n.length)
    throw new RangeError(
      `Invalid range [${e}, ${t}) for text length ${n.length}`
    );
  const r = i.ownerDocument, a = r.createTreeWalker(
    i,
    r.defaultView.NodeFilter.SHOW_TEXT
  );
  let o = 0, s = null, l = 0, c = null, d = 0;
  for (let h = a.nextNode(); h; h = a.nextNode()) {
    const g = o + h.data.length;
    if (s === null && e >= o && e < g && (s = h, l = e - o), c === null && t > o && t <= g && (c = h, d = t - o), s && c)
      break;
    o = g;
  }
  if (!s || !c)
    throw new Error(
      "Could not map offsets to the DOM. The DOM may have changed."
    );
  const u = r.createRange();
  return u.setStart(s, l), u.setEnd(c, d), u;
}
const f = "website-highlighter", w = `${f}:response`, m = 500;
let y = 0;
function H(i) {
  return new Promise((e) => globalThis.setTimeout(e, i));
}
function S(i, e) {
  const t = i.ownerDocument?.defaultView ?? window;
  return t.MutationObserver ? new Promise((n) => {
    let r;
    const a = new t.MutationObserver(() => {
      t.clearTimeout(r), a.disconnect(), n(!0);
    });
    r = t.setTimeout(() => {
      a.disconnect(), n(!1);
    }, e), a.observe(i, {
      childList: !0,
      characterData: !0,
      subtree: !0
    });
  }) : H(e).then(() => !1);
}
function x(i, e, t) {
  const n = Math.max(i.length, e.length);
  return n === 0 ? 1 : (n - t) / n;
}
function p(i, e) {
  const t = e.textContent ?? "", { start: n, end: r, value: a, distance: o } = b(i, t), s = e.ownerDocument?.defaultView ?? window;
  if (!s.CSS?.highlights || !s.Highlight) throw new Error("This browser does not support the CSS Custom Highlight API.");
  return {
    haystack: t,
    range: n < r ? I(e, n, r) : null,
    value: a,
    view: s,
    score: x(i, a, o)
  };
}
function E({ range: i, value: e, view: t }) {
  if (!i) throw new Error("Could not find text to highlight.");
  return t.CSS.highlights.set(f, new t.Highlight(i)), { range: i, value: e };
}
async function v(i, e, t, n, r) {
  let a = 0;
  for (; ; ) {
    const o = p(i, e);
    if (o.score >= t) return E(o);
    for (; a < n; ) {
      const s = await S(e, r);
      if (a += 1, s) break;
    }
    if (a >= n) throw new Error(`Could not find "${i}" with threshold ${t}. Best match was "${o.value}".`);
  }
}
function C(i, {
  root: e = document.body,
  threshold: t = 0,
  retries: n = 6,
  retryInterval: r = m
} = {}) {
  return t > 0 ? v(i, e, t, n, r) : E(p(i, e));
}
function N(i, e, t = "*") {
  if (!i?.contentWindow) throw new TypeError("Expected an iframe with a contentWindow");
  const n = `${Date.now()}-${y++}`, r = i.contentWindow;
  let a;
  function o() {
    r.postMessage({
      type: f,
      id: n,
      text: e
    }, t);
  }
  function s(l) {
    l.source === r && l.data?.type === w && l.data.id === n && (window.clearInterval(a), window.removeEventListener("message", s));
  }
  window.addEventListener("message", s), o(), a = window.setInterval(o, m);
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
