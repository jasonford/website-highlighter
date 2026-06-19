export default function rangeFromTextContentOffsets(root, start, end) {
  const haystack = root.textContent ?? "";

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    start >= end ||
    end > haystack.length
  ) {
    throw new RangeError(
      `Invalid range [${start}, ${end}) for text length ${haystack.length}`
    );
  }

  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(
    root,
    doc.defaultView.NodeFilter.SHOW_TEXT
  );

  let position = 0;

  let startNode = null;
  let startOffset = 0;

  let endNode = null;
  let endOffset = 0;

  for (
    let node = walker.nextNode();
    node;
    node = walker.nextNode()
  ) {
    const nextPosition = position + node.data.length;

    // Treat a start exactly on a boundary as offset 0
    // in the following text node.
    if (
      startNode === null &&
      start >= position &&
      start < nextPosition
    ) {
      startNode = node;
      startOffset = start - position;
    }

    // Treat an end exactly on a boundary as the end
    // of the preceding text node.
    if (
      endNode === null &&
      end > position &&
      end <= nextPosition
    ) {
      endNode = node;
      endOffset = end - position;
    }

    if (startNode && endNode) {
      break;
    }

    position = nextPosition;
  }

  if (!startNode || !endNode) {
    throw new Error(
      "Could not map offsets to the DOM. The DOM may have changed."
    );
  }

  const range = doc.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  return range;
}
