class H {
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
      let i = [[s + 1, 0]];
      for (let o = 0; o < t.length; o++) {
        let a = e[s] != t[o], l = r[o + 1][0] + 1, c = i[o][0] + 1, w = r[o][0] + a, h = Math.min(l, Math.min(c, w)), d = [h, r[o][1]];
        l === h ? d[1] = r[o + 1][1] - 1 : c === h && (d[1] = i[o][1] + 1), i.push(d);
      }
      r = i;
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
    let r = this.getEditDistances(e, t), s = [0], i = r[0][0];
    for (let a = 1; a < r.length; a++) {
      let l = r[a][0];
      l < i ? (s = [a], i = l) : l == i && s.push(a);
    }
    let o = [];
    for (let a of s) {
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
  return new H().getMatches(n, e);
}
function v(n, e) {
  const t = x(n, e);
  let r;
  for (const a of t)
    (r === void 0 || a.distance < r.distance) && (r = a);
  const s = Math.max(r.start, 0), i = Math.min(Math.max(r.end, s), e.length);
  return { value: e.slice(s, i), start: s, end: i, distance: r.distance };
}
const k = `(function(){"use strict";class h{getEditDistances(s,i){var t=new Array(i.length+1).fill([0,0]);for(let e=0;e<s.length;e++){let r=[[e+1,0]];for(let l=0;l<i.length;l++){let n=s[e]!=i[l],a=t[l+1][0]+1,o=r[l][0]+1,m=t[l][0]+n,u=Math.min(a,Math.min(o,m)),f=[u,t[l][1]];a===u?f[1]=t[l+1][1]-1:o===u&&(f[1]=r[l][1]+1),r.push(f)}t=r}return t}getMatches(s,i){let t=this.getEditDistances(s,i),e=[0],r=t[0][0];for(let n=1;n<t.length;n++){let a=t[n][0];a<r?(e=[n],r=a):a==r&&e.push(n)}let l=[];for(let n of e){let a=t[n],o={distance:a[0],start:n-s.length-a[1],end:n};l.push(o)}return l}}function g(c,s){return new h().getMatches(c,s)}function d(c,s){const i=g(c,s);let t;for(const n of i)(t===void 0||n.distance<t.distance)&&(t=n);const e=Math.max(t.start,0),r=Math.min(Math.max(t.end,e),s.length);return{value:s.slice(e,r),start:e,end:r,distance:t.distance}}self.addEventListener("message",c=>{const{id:s,query:i,source:t}=c.data;try{self.postMessage({id:s,result:d(i,t)})}catch(e){self.postMessage({id:s,error:e instanceof Error?e.message:String(e)})}})})();
`, y = typeof self < "u" && self.Blob && new Blob(["(self.URL || self.webkitURL).revokeObjectURL(self.location.href);", k], { type: "text/javascript;charset=utf-8" });
function S(n) {
  let e;
  try {
    if (e = y && (self.URL || self.webkitURL).createObjectURL(y), !e) throw "";
    const t = new Worker(e, {
      name: n?.name
    });
    return t.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(e);
    }), t;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(k),
      {
        name: n?.name
      }
    );
  }
}
let u, W = 0, p = !1, E = "sync";
const f = /* @__PURE__ */ new Map();
function C(n) {
  for (const { reject: e } of f.values())
    e(n);
  f.clear();
}
function M(n) {
  p = !0, u && (u.terminate(), u = void 0), C(n);
}
function D() {
  if (!(p || typeof Worker > "u")) {
    if (u) return u;
    try {
      u = new S();
    } catch {
      p = !0;
      return;
    }
    return u.addEventListener("message", (n) => {
      const e = f.get(n.data?.id);
      e && (f.delete(n.data.id), n.data.error ? e.reject(new Error(n.data.error)) : e.resolve(n.data.result));
    }), u.addEventListener("error", (n) => {
      M(n.error ?? new Error(n.message || "Worker matcher failed."));
    }), u.addEventListener("messageerror", () => {
      M(new Error("Worker matcher could not deserialize a message."));
    }), u;
  }
}
function O(n, e) {
  const t = D();
  if (!t) return;
  const r = W++;
  return new Promise((s, i) => {
    f.set(r, { resolve: s, reject: i });
    try {
      t.postMessage({ id: r, query: n, source: e });
    } catch (o) {
      f.delete(r), i(o);
    }
  });
}
function N() {
  return E;
}
async function U(n, e) {
  const t = O(n, e);
  if (t)
    try {
      const r = await t;
      return E = "worker", r;
    } catch (r) {
      M(r);
    }
  return E = "sync", v(n, e);
}
function $(n, e, t) {
  const r = n.textContent ?? "";
  if (!Number.isInteger(e) || !Number.isInteger(t) || e < 0 || e >= t || t > r.length)
    throw new RangeError(
      `Invalid range [${e}, ${t}) for text length ${r.length}`
    );
  const s = n.ownerDocument, i = s.createTreeWalker(
    n,
    s.defaultView.NodeFilter.SHOW_TEXT
  );
  let o = 0, a = null, l = 0, c = null, w = 0;
  for (let d = i.nextNode(); d; d = i.nextNode()) {
    const m = o + d.data.length;
    if (a === null && e >= o && e < m && (a = d, l = e - o), c === null && t > o && t <= m && (c = d, w = t - o), a && c)
      break;
    o = m;
  }
  if (!a || !c)
    throw new Error(
      "Could not map offsets to the DOM. The DOM may have changed."
    );
  const h = s.createRange();
  return h.setStart(a, l), h.setEnd(c, w), h;
}
const g = "website-highlighter", R = `${g}:response`, T = 500, b = `${g}-default-style`;
let j = 0;
function _(n) {
  return new Promise((e) => globalThis.setTimeout(e, n));
}
function q(n, e) {
  const t = n.ownerDocument?.defaultView ?? window;
  return t.MutationObserver ? new Promise((r) => {
    let s;
    const i = new t.MutationObserver(() => {
      t.clearTimeout(s), i.disconnect(), r(!0);
    });
    s = t.setTimeout(() => {
      i.disconnect(), r(!1);
    }, e), i.observe(n, {
      childList: !0,
      characterData: !0,
      subtree: !0
    });
  }) : _(e).then(() => !1);
}
function P(n, e, t) {
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
  const r = e.innerHeight || e.document.documentElement.clientHeight, s = t.top + e.scrollY - r / 2 + t.height / 2;
  e.scrollTo({
    top: Math.max(0, s),
    behavior: "smooth"
  });
}
function V(n) {
  const { document: e } = n;
  if (!e || e.getElementById(b))
    return;
  const t = e.createElement("style");
  t.id = b, t.textContent = `
::highlight(${g}) {
  background-color: Highlight;
  color: HighlightText;
}
`;
  const r = e.head || e.documentElement;
  r.insertBefore(t, r.firstChild);
}
async function I(n, e) {
  const t = e.textContent ?? "", r = e.ownerDocument?.defaultView ?? window;
  if (!r.CSS?.highlights || !r.Highlight) throw new Error("This browser does not support the CSS Custom Highlight API.");
  const { start: s, end: i, value: o, distance: a } = await U(n, t);
  return {
    haystack: t,
    range: s < i ? $(e, s, i) : null,
    value: o,
    view: r,
    score: P(n, o, a)
  };
}
function L({ range: n, value: e, view: t }) {
  if (!n) throw new Error("Could not find text to highlight.");
  return V(t), t.CSS.highlights.set(g, new t.Highlight(n)), G(n, t), { range: n, value: e };
}
async function z(n, e, t, r, s) {
  let i = 0;
  for (; ; ) {
    const o = await I(n, e);
    if (o.score >= t) return L(o);
    for (; i < r; ) {
      const a = await q(e, s);
      if (i += 1, a) break;
    }
    if (i >= r) throw new Error(`Could not find "${n}" with threshold ${t}. Best match was "${o.value}".`);
  }
}
function F() {
  return N();
}
async function A(n, {
  root: e = document.body,
  threshold: t = 0,
  retries: r = 6,
  retryInterval: s = T
} = {}) {
  return t > 0 ? z(n, e, t, r, s) : L(await I(n, e));
}
function Y(n, e, t = "*") {
  if (!n?.contentWindow) throw new TypeError("Expected an iframe with a contentWindow");
  const r = `${Date.now()}-${j++}`, s = n.contentWindow;
  let i;
  function o() {
    s.postMessage({
      type: g,
      id: r,
      text: e
    }, t);
  }
  function a(l) {
    l.source === s && l.data?.type === R && l.data.id === r && (window.clearInterval(i), window.removeEventListener("message", a));
  }
  window.addEventListener("message", a), o(), i = window.setInterval(o, T);
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
    t.data?.type === g && (e(t), A(t.data.text, { threshold: 0.9 }).catch((r) => console.error(r)));
  });
}
export {
  A as default,
  F as getMatcherMode,
  Y as highlightInIframe
};
