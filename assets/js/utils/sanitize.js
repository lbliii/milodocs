/**
 * Minimal HTML sanitization utilities (no external deps)
 * - Removes <script> tags
 * - Strips event handler attributes (on*)
 * - Disallows javascript:, data: in href/src (keeps http(s), mailto, tel)
 * - Preserves basic markup produced by our renderers
 */

/**
 * Sanitize an HTML string and return a safe string
 * @param {string} html
 * @returns {string}
 */
export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove script, noscript
    doc.querySelectorAll('script, noscript').forEach((el) => el.remove());

    // Walk all elements and sanitize attributes
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null);
    while (walker.nextNode()) {
      const el = walker.currentNode;
      // Remove event handlers
      [...el.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          return;
        }

        const value = attr.value.trim();
        if (name === 'href' || name === 'src') {
          const lower = value.toLowerCase();
          // Allow http(s), mailto, tel, relative URLs
          const allowed = /^(https?:|mailto:|tel:|\/|\.\/|#|$)/.test(lower);
          if (!allowed) {
            el.removeAttribute(attr.name);
          }
        }
      });
    }

    return doc.body.innerHTML;
  } catch (e) {
    // In case DOMParser fails, fall back to plain text
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
}

/**
 * Set sanitized HTML into an element
 * @param {HTMLElement} element
 * @param {string} html
 */
export function setSafeHTML(element, html) {
  if (!element) return;
  element.innerHTML = sanitizeHTML(html);
}

/**
 * Escape plain text to HTML entities
 * @param {string} text
 * @returns {string}
 */
export function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}


