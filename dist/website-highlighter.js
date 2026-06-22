class v {
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
    for (let i = 0; i < e.length; i++) {
      let s = [[i + 1, 0]];
      for (let o = 0; o < t.length; o++) {
        let a = e[i] != t[o], l = r[o + 1][0] + 1, c = s[o][0] + 1, w = r[o][0] + a, h = Math.min(l, Math.min(c, w)), u = [h, r[o][1]];
        l === h ? u[1] = r[o + 1][1] - 1 : c === h && (u[1] = s[o][1] + 1), s.push(u);
      }
      r = s;
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
    let r = this.getEditDistances(e, t), i = [0], s = r[0][0];
    for (let a = 1; a < r.length; a++) {
      let l = r[a][0];
      l < s ? (i = [a], s = l) : l == s && i.push(a);
    }
    let o = [];
    for (let a of i) {
      let l = r[a], c = {
        distance: l[0],
        start: a - e.length - l[1],
        //simplification of startPos = endPos − (needleLength + insertions − deletions)
        end: a
      };
      o.push(c);
    }
    return o;
  }
}
function x(n, e) {
  return new v().getMatches(n, e);
}
function W(n, e) {
  const t = x(n, e);
  let r;
  for (const a of t)
    (r === void 0 || a.distance < r.distance) && (r = a);
  const i = Math.max(r.start, 0), s = Math.min(Math.max(r.end, i), e.length);
  return { value: e.slice(i, s), start: i, end: s, distance: r.distance };
}
const T = `(function(){"use strict";class h{getEditDistances(s,i){var t=new Array(i.length+1).fill([0,0]);for(let e=0;e<s.length;e++){let r=[[e+1,0]];for(let l=0;l<i.length;l++){let n=s[e]!=i[l],a=t[l+1][0]+1,o=r[l][0]+1,m=t[l][0]+n,u=Math.min(a,Math.min(o,m)),f=[u,t[l][1]];a===u?f[1]=t[l+1][1]-1:o===u&&(f[1]=r[l][1]+1),r.push(f)}t=r}return t}getMatches(s,i){let t=this.getEditDistances(s,i),e=[0],r=t[0][0];for(let n=1;n<t.length;n++){let a=t[n][0];a<r?(e=[n],r=a):a==r&&e.push(n)}let l=[];for(let n of e){let a=t[n],o={distance:a[0],start:n-s.length-a[1],end:n};l.push(o)}return l}}function g(c,s){return new h().getMatches(c,s)}function d(c,s){const i=g(c,s);let t;for(const n of i)(t===void 0||n.distance<t.distance)&&(t=n);const e=Math.max(t.start,0),r=Math.min(Math.max(t.end,e),s.length);return{value:s.slice(e,r),start:e,end:r,distance:t.distance}}self.addEventListener("message",c=>{const{id:s,query:i,source:t}=c.data;try{self.postMessage({id:s,result:d(i,t)})}catch(e){self.postMessage({id:s,error:e instanceof Error?e.message:String(e)})}})})();
`, I = typeof self < "u" && self.Blob && new Blob(["(self.URL || self.webkitURL).revokeObjectURL(self.location.href);", T], { type: "text/javascript;charset=utf-8" });
function S(n) {
  let e;
  try {
    if (e = I && (self.URL || self.webkitURL).createObjectURL(I), !e) throw "";
    const t = new Worker(e, {
      name: n?.name
    });
    return t.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), t;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(T),
      {
        name: n?.name
      }
    );
  }
}
let d, C = 0, p = !1, E = "sync";
const g = /* @__PURE__ */ new Map();
function D(n) {
  for (const { reject: e } of g.values())
    e(n);
  g.clear();
}
function M(n) {
  p = !0, d && (d.terminate(), d = void 0), D(n);
}
function O() {
  if (!(p || typeof Worker > "u")) {
    if (d) return d;
    try {
      d = new S();
    } catch {
      p = !0;
      return;
    }
    return d.addEventListener("message", (n) => {
      const e = g.get(n.data?.id);
      e && (g.delete(n.data.id), n.data.error ? e.reject(new Error(n.data.error)) : e.resolve(n.data.result));
    }), d.addEventListener("error", (n) => {
      M(n.error ?? new Error(n.message || "Worker matcher failed."));
    }), d.addEventListener("messageerror", () => {
      M(new Error("Worker matcher could not deserialize a message."));
    }), d;
  }
}
function $(n, e) {
  const t = O();
  if (!t) return;
  const r = C++;
  return new Promise((i, s) => {
    g.set(r, { resolve: i, reject: s });
    try {
      t.postMessage({ id: r, query: n, source: e });
    } catch (o) {
      g.delete(r), s(o);
    }
  });
}
function N() {
  return E;
}
async function U(n, e) {
  const t = $(n, e);
  if (t)
    try {
      const r = await t;
      return E = "worker", r;
    } catch (r) {
      M(r);
    }
  return E = "sync", W(n, e);
}
function j(n, e, t) {
  const r = n.textContent ?? "";
  if (!Number.isInteger(e) || !Number.isInteger(t) || e < 0 || e >= t || t > r.length)
    throw new RangeError(
      `Invalid range [${e}, ${t}) for text length ${r.length}`
    );
  const i = n.ownerDocument, s = i.createTreeWalker(
    n,
    i.defaultView.NodeFilter.SHOW_TEXT
  );
  let o = 0, a = null, l = 0, c = null, w = 0;
  for (let u = s.nextNode(); u; u = s.nextNode()) {
    const m = o + u.data.length;
    if (a === null && e >= o && e < m && (a = u, l = e - o), c === null && t > o && t <= m && (c = u, w = t - o), a && c)
      break;
    o = m;
  }
  if (!a || !c)
    throw new Error(
      "Could not map offsets to the DOM. The DOM may have changed."
    );
  const h = i.createRange();
  return h.setStart(a, l), h.setEnd(c, w), h;
}
const f = "website-highlighter", y = `${f}:response`, b = 500, R = `${f}-default-style`;
let k = 0;
function q(n) {
  return new Promise((e) => globalThis.setTimeout(e, n));
}
function P(n, e) {
  const t = n.ownerDocument?.defaultView ?? window;
  return t.MutationObserver ? new Promise((r) => {
    let i;
    const s = new t.MutationObserver(() => {
      t.clearTimeout(i), s.disconnect(), r(!0);
    });
    i = t.setTimeout(() => {
      s.disconnect(), r(!1);
    }, e), s.observe(n, {
      childList: !0,
      characterData: !0,
      subtree: !0
    });
  }) : q(e).then(() => !1);
}
function _(n, e, t) {
  const r = Math.max(n.length, e.length);
  return r === 0 ? 1 : (r - t) / r;
}
function B(n) {
  const { startContainer: e } = n;
  return e.nodeType === e.ELEMENT_NODE ? e : e.parentElement;
}
function G(n, e) {
  const t = n.getClientRects()[0];
  if (!t) {
    B(n)?.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "smooth"
    });
    return;
  }
  const r = e.innerHeight || e.document.documentElement.clientHeight, i = t.top + e.scrollY - r / 2 + t.height / 2;
  e.scrollTo({
    top: Math.max(0, i),
    behavior: "smooth"
  });
}
function V(n) {
  const { document: e } = n;
  if (!e || e.getElementById(R))
    return;
  const t = e.createElement("style");
  t.id = R, t.textContent = `
::highlight(${f}) {
  background-color: Highlight;
  color: HighlightText;
}
`;
  const r = e.head || e.documentElement;
  r.insertBefore(t, r.firstChild);
}
async function L(n, e) {
  const t = e.textContent ?? "", r = e.ownerDocument?.defaultView ?? window;
  if (!r.CSS?.highlights || !r.Highlight) throw new Error("This browser does not support the CSS Custom Highlight API.");
  const { start: i, end: s, value: o, distance: a } = await U(n, t);
  return {
    haystack: t,
    range: i < s ? j(e, i, s) : null,
    value: o,
    view: r,
    score: _(n, o, a)
  };
}
function H({ range: n, value: e, view: t }) {
  if (!n) throw new Error("Could not find text to highlight.");
  return V(t), t.CSS.highlights.set(f, new t.Highlight(n)), G(n, t), { range: n, value: e };
}
async function z(n, e, t, r, i) {
  let s = 0;
  for (; ; ) {
    const o = await L(n, e);
    if (o.score >= t) return H(o);
    for (; s < r; ) {
      const a = await P(e, i);
      if (s += 1, a) break;
    }
    if (s >= r) throw new Error(`Could not find "${n}" with threshold ${t}. Best match was "${o.value}".`);
  }
}
function F() {
  return N();
}
async function A(n, {
  root: e = document.body,
  threshold: t = 0,
  retries: r = 6,
  retryInterval: i = b
} = {}) {
  return t > 0 ? z(n, e, t, r, i) : H(await L(n, e));
}
function Y(n, e, t = "*") {
  if (!n?.contentWindow) throw new TypeError("Expected an iframe with a contentWindow");
  const r = `${Date.now()}-${k++}`, i = n.contentWindow;
  let s;
  function o() {
    i.postMessage({
      type: f,
      id: r,
      text: e
    }, t);
  }
  function a(l) {
    l.source === i && l.data?.type === y && l.data.id === r && (window.clearInterval(s), window.removeEventListener("message", a));
  }
  window.addEventListener("message", a), o(), s = window.setInterval(o, b);
}
function X(n, e = "*") {
  if (typeof window > "u" || !window.parent || window.parent === window)
    throw new TypeError("Expected to be called from a child iframe");
  const t = `${Date.now()}-${k++}`, r = window.parent;
  let i;
  function s() {
    r.postMessage({
      type: f,
      id: t,
      text: n
    }, e);
  }
  function o(a) {
    a.source === r && a.data?.type === y && a.data.id === t && (window.clearInterval(i), window.removeEventListener("message", o));
  }
  window.addEventListener("message", o), s(), i = window.setInterval(s, b);
}
if (typeof window < "u") {
  let n = function(t) {
    return t.origin === "null" ? "*" : t.origin;
  }, e = function(t) {
    t.source?.postMessage({
      type: y,
      id: t.data.id
    }, n(t));
  };
  window.addEventListener("message", (t) => {
    t.data?.type === f && (e(t), A(t.data.text, { threshold: 0.9 }).catch((r) => console.error(r)));
  });
}
export {
  A as default,
  F as getMatcherMode,
  Y as highlightInIframe,
  X as highlightInParent
};
