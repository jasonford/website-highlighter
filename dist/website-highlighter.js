class w {
  /**
   * Calculates the Levenshtein distance for all substrings and returns their
   * distance and insertion-deletion offset.
   * 
   * @param {string} needle The search string.
   * @param {string} haystack The string to search.
   * 
   * @return {array} Array of all substring matches in pairs [distance, offset]
   */
  getEditDistances(t, o) {
    var n = new Array(o.length + 1).fill([0, 0]);
    for (let s = 0; s < t.length; s++) {
      let r = [[s + 1, 0]];
      for (let e = 0; e < o.length; e++) {
        let i = t[s] != o[e], a = n[e + 1][0] + 1, h = r[e][0] + 1, g = n[e][0] + i, f = Math.min(a, Math.min(h, g)), c = [f, n[e][1]];
        a === f ? c[1] = n[e + 1][1] - 1 : h === f && (c[1] = r[e][1] + 1), r.push(c);
      }
      n = r;
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
  getMatches(t, o) {
    let n = this.getEditDistances(t, o), s = [0], r = n[0][0];
    for (let i = 1; i < n.length; i++) {
      let a = n[i][0];
      a < r ? (s = [i], r = a) : a == r && s.push(i);
    }
    let e = [];
    for (let i of s) {
      let a = n[i], h = {
        distance: a[0],
        start: i - t.length - a[1],
        //simplification of startPos = endPos − (needleLength + insertions − deletions)
        end: i
      };
      e.push(h);
    }
    return e;
  }
}
function m(l, t) {
  return new w().getMatches(l, t);
}
function p(l, t) {
  const o = m(l, t);
  let n;
  for (const i of o)
    (n === void 0 || i.distance < n.distance) && (n = i);
  const s = Math.max(n.start, 0), r = Math.min(Math.max(n.end, s), t.length);
  return { value: t.slice(s, r), start: s, end: r };
}
function x(l, t, o) {
  const n = l.textContent ?? "";
  if (!Number.isInteger(t) || !Number.isInteger(o) || t < 0 || t >= o || o > n.length)
    throw new RangeError(
      `Invalid range [${t}, ${o}) for text length ${n.length}`
    );
  const s = l.ownerDocument, r = s.createTreeWalker(
    l,
    s.defaultView.NodeFilter.SHOW_TEXT
  );
  let e = 0, i = null, a = 0, h = null, g = 0;
  for (let c = r.nextNode(); c; c = r.nextNode()) {
    const d = e + c.data.length;
    if (i === null && t >= e && t < d && (i = c, a = t - e), h === null && o > e && o <= d && (h = c, g = o - e), i && h)
      break;
    e = d;
  }
  if (!i || !h)
    throw new Error(
      "Could not map offsets to the DOM. The DOM may have changed."
    );
  const f = s.createRange();
  return f.setStart(i, a), f.setEnd(h, g), f;
}
const u = "dom-highlight";
function M(l, t = document.body) {
  const o = t.textContent ?? "", { start: n, end: s } = p(l, o), r = x(t, n, s), e = t.ownerDocument?.defaultView ?? window;
  if (!e.CSS?.highlights || !e.Highlight)
    throw new Error("This browser does not support the CSS Custom Highlight API.");
  return e.CSS.highlights.set(u, new e.Highlight(r)), r;
}
function b(l, t, o = "*") {
  if (!l?.contentWindow)
    throw new TypeError("Expected an iframe with a contentWindow");
  l.contentWindow.postMessage({
    type: u,
    text: t
  }, o);
}
typeof window < "u" && window.addEventListener("message", (l) => {
  l.data?.type !== u || typeof l.data.text != "string" || M(l.data.text, document.body);
});
export {
  M as default,
  b as highlightInIframe
};
