class I {
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
    var r = new Array(t.length + 1).fill([0, 0]);
    for (let s = 0; s < e.length; s++) {
      let o = [[s + 1, 0]];
      for (let i = 0; i < t.length; i++) {
        let a = e[s] != t[i], l = r[i + 1][0] + 1, c = o[i][0] + 1, g = r[i][0] + a, f = Math.min(l, Math.min(c, g)), d = [f, r[i][1]];
        l === f ? d[1] = r[i + 1][1] - 1 : c === f && (d[1] = o[i][1] + 1), o.push(d);
      }
      r = o;
    }
    return r;
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
    let r = this.getEditDistances(e, t), s = [0], o = r[0][0];
    for (let a = 1; a < r.length; a++) {
      let l = r[a][0];
      l < o ? (s = [a], o = l) : l == o && s.push(a);
    }
    let i = [];
    for (let a of s) {
      let l = r[a], c = {
        distance: l[0],
        start: a - e.length - l[1],
        //simplification of startPos = endPos − (needleLength + insertions − deletions)
        end: a
      };
      i.push(c);
    }
    return i;
  }
}
function v(n, e) {
  return new I().getMatches(n, e);
}
function x(n, e) {
  const t = v(n, e);
  let r;
  for (const a of t)
    (r === void 0 || a.distance < r.distance) && (r = a);
  const s = Math.max(r.start, 0), o = Math.min(Math.max(r.end, s), e.length);
  return { value: e.slice(s, o), start: s, end: o, distance: r.distance };
}
const y = `(function(){"use strict";class h{getEditDistances(s,i){var t=new Array(i.length+1).fill([0,0]);for(let e=0;e<s.length;e++){let r=[[e+1,0]];for(let l=0;l<i.length;l++){let n=s[e]!=i[l],a=t[l+1][0]+1,o=r[l][0]+1,m=t[l][0]+n,u=Math.min(a,Math.min(o,m)),f=[u,t[l][1]];a===u?f[1]=t[l+1][1]-1:o===u&&(f[1]=r[l][1]+1),r.push(f)}t=r}return t}getMatches(s,i){let t=this.getEditDistances(s,i),e=[0],r=t[0][0];for(let n=1;n<t.length;n++){let a=t[n][0];a<r?(e=[n],r=a):a==r&&e.push(n)}let l=[];for(let n of e){let a=t[n],o={distance:a[0],start:n-s.length-a[1],end:n};l.push(o)}return l}}function g(c,s){return new h().getMatches(c,s)}function d(c,s){const i=g(c,s);let t;for(const n of i)(t===void 0||n.distance<t.distance)&&(t=n);const e=Math.max(t.start,0),r=Math.min(Math.max(t.end,e),s.length);return{value:s.slice(e,r),start:e,end:r,distance:t.distance}}self.addEventListener("message",c=>{const{id:s,query:i,source:t}=c.data;try{self.postMessage({id:s,result:d(i,t)})}catch(e){self.postMessage({id:s,error:e instanceof Error?e.message:String(e)})}})})();
`, b = typeof self < "u" && self.Blob && new Blob(["(self.URL || self.webkitURL).revokeObjectURL(self.location.href);", y], { type: "text/javascript;charset=utf-8" });
function W(n) {
  let e;
  try {
    if (e = b && (self.URL || self.webkitURL).createObjectURL(b), !e) throw "";
    const t = new Worker(e, {
      name: n?.name
    });
    return t.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), t;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(y),
      {
        name: n?.name
      }
    );
  }
}
let u, H = 0, p = !1, M = "sync";
const h = /* @__PURE__ */ new Map();
function S(n) {
  for (const { reject: e } of h.values())
    e(n);
  h.clear();
}
function E(n) {
  p = !0, u && (u.terminate(), u = void 0), S(n);
}
function C() {
  if (!(p || typeof Worker > "u")) {
    if (u) return u;
    try {
      u = new W();
    } catch {
      p = !0;
      return;
    }
    return u.addEventListener("message", (n) => {
      const e = h.get(n.data?.id);
      e && (h.delete(n.data.id), n.data.error ? e.reject(new Error(n.data.error)) : e.resolve(n.data.result));
    }), u.addEventListener("error", (n) => {
      E(n.error ?? new Error(n.message || "Worker matcher failed."));
    }), u.addEventListener("messageerror", () => {
      E(new Error("Worker matcher could not deserialize a message."));
    }), u;
  }
}
function O(n, e) {
  const t = C();
  if (!t) return;
  const r = H++;
  return new Promise((s, o) => {
    h.set(r, { resolve: s, reject: o });
    try {
      t.postMessage({ id: r, query: n, source: e });
    } catch (i) {
      h.delete(r), o(i);
    }
  });
}
function D() {
  return M;
}
async function N(n, e) {
  const t = O(n, e);
  if (t)
    try {
      const r = await t;
      return M = "worker", r;
    } catch (r) {
      E(r);
    }
  return M = "sync", x(n, e);
}
function U(n, e, t) {
  const r = n.textContent ?? "";
  if (!Number.isInteger(e) || !Number.isInteger(t) || e < 0 || e >= t || t > r.length)
    throw new RangeError(
      `Invalid range [${e}, ${t}) for text length ${r.length}`
    );
  const s = n.ownerDocument, o = s.createTreeWalker(
    n,
    s.defaultView.NodeFilter.SHOW_TEXT
  );
  let i = 0, a = null, l = 0, c = null, g = 0;
  for (let d = o.nextNode(); d; d = o.nextNode()) {
    const m = i + d.data.length;
    if (a === null && e >= i && e < m && (a = d, l = e - i), c === null && t > i && t <= m && (c = d, g = t - i), a && c)
      break;
    i = m;
  }
  if (!a || !c)
    throw new Error(
      "Could not map offsets to the DOM. The DOM may have changed."
    );
  const f = s.createRange();
  return f.setStart(a, l), f.setEnd(c, g), f;
}
const w = "website-highlighter", R = `${w}:response`, k = 500;
let j = 0;
function $(n) {
  return new Promise((e) => globalThis.setTimeout(e, n));
}
function q(n, e) {
  const t = n.ownerDocument?.defaultView ?? window;
  return t.MutationObserver ? new Promise((r) => {
    let s;
    const o = new t.MutationObserver(() => {
      t.clearTimeout(s), o.disconnect(), r(!0);
    });
    s = t.setTimeout(() => {
      o.disconnect(), r(!1);
    }, e), o.observe(n, {
      childList: !0,
      characterData: !0,
      subtree: !0
    });
  }) : $(e).then(() => !1);
}
function P(n, e, t) {
  const r = Math.max(n.length, e.length);
  return r === 0 ? 1 : (r - t) / r;
}
function _(n) {
  const { startContainer: e } = n;
  return e.nodeType === e.ELEMENT_NODE ? e : e.parentElement;
}
function V(n, e) {
  const t = n.getClientRects()[0];
  if (!t) {
    _(n)?.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "smooth"
    });
    return;
  }
  const r = e.innerHeight || e.document.documentElement.clientHeight, s = t.top + e.scrollY - r / 2 + t.height / 2;
  e.scrollTo({
    top: Math.max(0, s),
    behavior: "smooth"
  });
}
async function L(n, e) {
  const t = e.textContent ?? "", r = e.ownerDocument?.defaultView ?? window;
  if (!r.CSS?.highlights || !r.Highlight) throw new Error("This browser does not support the CSS Custom Highlight API.");
  const { start: s, end: o, value: i, distance: a } = await N(n, t);
  return {
    haystack: t,
    range: s < o ? U(e, s, o) : null,
    value: i,
    view: r,
    score: P(n, i, a)
  };
}
function T({ range: n, value: e, view: t }) {
  if (!n) throw new Error("Could not find text to highlight.");
  return t.CSS.highlights.set(w, new t.Highlight(n)), V(n, t), { range: n, value: e };
}
async function z(n, e, t, r, s) {
  let o = 0;
  for (; ; ) {
    const i = await L(n, e);
    if (i.score >= t) return T(i);
    for (; o < r; ) {
      const a = await q(e, s);
      if (o += 1, a) break;
    }
    if (o >= r) throw new Error(`Could not find "${n}" with threshold ${t}. Best match was "${i.value}".`);
  }
}
function F() {
  return D();
}
async function A(n, {
  root: e = document.body,
  threshold: t = 0,
  retries: r = 6,
  retryInterval: s = k
} = {}) {
  return t > 0 ? z(n, e, t, r, s) : T(await L(n, e));
}
function B(n, e, t = "*") {
  if (!n?.contentWindow) throw new TypeError("Expected an iframe with a contentWindow");
  const r = `${Date.now()}-${j++}`, s = n.contentWindow;
  let o;
  function i() {
    s.postMessage({
      type: w,
      id: r,
      text: e
    }, t);
  }
  function a(l) {
    l.source === s && l.data?.type === R && l.data.id === r && (window.clearInterval(o), window.removeEventListener("message", a));
  }
  window.addEventListener("message", a), i(), o = window.setInterval(i, k);
}
if (typeof window < "u") {
  let n = function(t) {
    return t.origin === "null" ? "*" : t.origin;
  }, e = function(t) {
    t.source?.postMessage({
      type: R,
      id: t.data.id
    }, n(t));
  };
  window.addEventListener("message", (t) => {
    t.data?.type === w && (e(t), A(t.data.text, { threshold: 0.9 }).catch((r) => console.error(r)));
  });
}
export {
  A as default,
  F as getMatcherMode,
  B as highlightInIframe
};
