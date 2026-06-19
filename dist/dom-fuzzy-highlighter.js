class d {
  /**
   * Calculates the Levenshtein distance for all substrings and returns their
   * distance and insertion-deletion offset.
   * 
   * @param {string} needle The search string.
   * @param {string} haystack The string to search.
   * 
   * @return {array} Array of all substring matches in pairs [distance, offset]
   */
  getEditDistances(t, i) {
    var e = new Array(i.length + 1).fill([0, 0]);
    for (let s = 0; s < t.length; s++) {
      let r = [[s + 1, 0]];
      for (let n = 0; n < i.length; n++) {
        let l = t[s] != i[n], o = e[n + 1][0] + 1, h = r[n][0] + 1, u = e[n][0] + l, f = Math.min(o, Math.min(h, u)), c = [f, e[n][1]];
        o === f ? c[1] = e[n + 1][1] - 1 : h === f && (c[1] = r[n][1] + 1), r.push(c);
      }
      e = r;
    }
    return e;
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
  getMatches(t, i) {
    let e = this.getEditDistances(t, i), s = [0], r = e[0][0];
    for (let l = 1; l < e.length; l++) {
      let o = e[l][0];
      o < r ? (s = [l], r = o) : o == r && s.push(l);
    }
    let n = [];
    for (let l of s) {
      let o = e[l], h = {
        distance: o[0],
        start: l - t.length - o[1],
        //simplification of startPos = endPos − (needleLength + insertions − deletions)
        end: l
      };
      n.push(h);
    }
    return n;
  }
}
function m(a, t) {
  return new d().getMatches(a, t);
}
function w(a, t) {
  const i = m(a, t);
  let e;
  for (const l of i)
    (e === void 0 || l.distance < e.distance) && (e = l);
  const s = Math.max(e.start, 0), r = Math.min(Math.max(e.end, s), t.length);
  return { value: t.slice(s, r), start: s, end: r };
}
function x(a, t, i) {
  const e = a.textContent ?? "";
  if (!Number.isInteger(t) || !Number.isInteger(i) || t < 0 || t >= i || i > e.length)
    throw new RangeError(
      `Invalid range [${t}, ${i}) for text length ${e.length}`
    );
  const s = a.ownerDocument, r = s.createTreeWalker(
    a,
    s.defaultView.NodeFilter.SHOW_TEXT
  );
  let n = 0, l = null, o = 0, h = null, u = 0;
  for (let c = r.nextNode(); c; c = r.nextNode()) {
    const g = n + c.data.length;
    if (l === null && t >= n && t < g && (l = c, o = t - n), h === null && i > n && i <= g && (h = c, u = i - n), l && h)
      break;
    n = g;
  }
  if (!l || !h)
    throw new Error(
      "Could not map offsets to the DOM. The DOM may have changed."
    );
  const f = s.createRange();
  return f.setStart(l, o), f.setEnd(h, u), f;
}
function M(a, t = document.body) {
  const i = t.textContent ?? "", { start: e, end: s } = w(a, i), r = x(t, e, s);
  return CSS.highlights.set("fuzzy-text-match", new Highlight(r)), r;
}
export {
  M as default
};
