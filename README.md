# website-highlighter

Fuzzy text matching and highlighting for DOM content using the CSS Custom Highlight API.

## Install

```sh
npm install website-highlighter
```

## Basic Usage

Import the default function and pass the text you want to find. The library finds the closest fuzzy match inside the target root and applies a `dom-highlight` CSS highlight.

```js
import WebsiteHighlighter from 'website-highlighter'

const article = document.querySelector('article')
const range = WebsiteHighlighter('custom highlight api', article)

console.log(range.toString())
```

Add styles for the highlight name:

```css
::highlight(dom-highlight) {
  background: #f6d85f;
  color: #111;
}
```

If no root is passed, the library searches `document.body`.

```js
WebsiteHighlighter('some text on the page')
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

The child iframe must load this module too. Importing it registers the message listener that handles `dom-highlight` messages.

```html
<script type="module">
  import 'website-highlighter'
</script>
```

You can pass a stricter `targetOrigin` as the third argument:

```js
highlightInIframe(iframe, 'text inside the iframe', 'https://example.com')
```

## API

### `WebsiteHighlighter(text, root)`

Finds the best fuzzy match for `text` inside `root`, applies the `dom-highlight` custom highlight, and returns the created `Range`.

- `text`: string to search for.
- `root`: optional DOM node to search. Defaults to `document.body`.

### `highlightInIframe(iframe, text, targetOrigin)`

Posts a highlight request to an iframe.

- `iframe`: target iframe element.
- `text`: string to search for inside the iframe document.
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
