# website-highlighter

Fuzzy text matching and highlighting for DOM content using the CSS Custom Highlight API.

## Install

```sh
npm install website-highlighter
```

## Basic Usage

Import the default function and pass the text you want to find. The library finds the closest fuzzy match inside the target root and applies a `website-highlighter` CSS highlight.

```js
import WebsiteHighlighter from 'website-highlighter'

const article = document.querySelector('article')
const { range, value } = await WebsiteHighlighter('custom highlight api', {
  root: article
})

console.log(range.toString())
console.log(value)
```

The library adds a default highlight style to the target document using system highlight colors. You can override it with your own styles for the highlight name:

```css
::highlight(website-highlighter) {
  background-color: Highlight;
  color: HighlightText;
}
```

If no root is passed, the library searches `document.body`.

```js
await WebsiteHighlighter('some text on the page')
```

## CDN Usage

The browser bundle can be loaded from a CDN as a single file. Fuzzy matching uses an inline Blob worker when the browser allows it, so you do not need to host a separate worker script.

```html
<script type="module">
  import WebsiteHighlighter from 'https://cdn.example.com/website-highlighter.js'

  await WebsiteHighlighter('some text on the page')
</script>
```

## Iframe Usage

The package also exports `highlightInIframe`, which sends a highlight request from a parent page to a child iframe.

```js
import { highlightInIframe } from 'website-highlighter'

const iframe = document.querySelector('iframe')

iframe.addEventListener('load', () => {
  highlightInIframe(iframe, 'text inside the iframe')
})
```

The child iframe must load this module too. Importing it registers the message listener that handles `website-highlighter` messages.

```html
<script type="module">
  import 'website-highlighter'
</script>
```

You can pass a stricter `targetOrigin` as the third argument:

```js
highlightInIframe(iframe, 'text inside the iframe', 'https://example.com')
```

Child iframes can send a highlight request to their parent window with `highlightInParent`:

```js
import { highlightInParent } from 'website-highlighter'

highlightInParent('text inside the parent page')
```

The parent page must load this module too so it can receive the request.

## API

### `WebsiteHighlighter(text, options)`

Finds the best fuzzy match for `text`, applies the `website-highlighter` custom highlight, scrolls the matched range into view, and resolves to `{ range, value }`.

- `text`: string to search for.
- `options.root`: optional DOM node to search. Defaults to `document.body`.
- `options.threshold`: optional minimum match score from `0` to `1`. When greater than `0`, the function retries until the threshold is met or retries are exhausted.
- `options.retries`: optional retry count. Defaults to `6`.
- `options.retryInterval`: optional retry delay in milliseconds. Defaults to `500`.

Fuzzy matching runs in a worker when the browser allows it. If worker creation is unavailable or blocked, the library falls back to synchronous matching on the main thread.

### `getMatcherMode()`

Returns `'worker'` or `'sync'` for the most recent match. This is intended for diagnostics and demos.

### `highlightInIframe(iframe, text, targetOrigin)`

Posts a highlight request to an iframe.

- `iframe`: target iframe element.
- `text`: string to search for inside the iframe document.
- `targetOrigin`: optional `postMessage` target origin. Defaults to `'*'`.

### `highlightInParent(text, targetOrigin)`

Posts a highlight request from a child iframe to its parent window.

- `text`: string to search for inside the parent document.
- `targetOrigin`: optional `postMessage` target origin. Defaults to `'*'`.

## Browser Support

This module requires the CSS Custom Highlight API, including `CSS.highlights` and `Highlight`. It throws an error when those APIs are unavailable.

## Development

Install dependencies:

```sh
npm install
```

Start the Vite test page:

```sh
npm run dev
```

Build the library:

```sh
npm run build
```
