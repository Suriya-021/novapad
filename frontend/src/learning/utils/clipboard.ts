/**
 * Safe, robust clipboard copy utility with automatic fallback.
 * Works seamlessly across modern browsers, HTTPS/HTTP, and sandboxed iframes.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern asynchronous Clipboard API if available
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText threw error, falling back:', err);
    }
  }

  // 2. Fallback to hidden textarea with document.execCommand('copy')
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Position off-screen and invisible
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    // For mobile/touch devices
    const range = document.createRange();
    range.selectNodeContents(textarea);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    textarea.setSelectionRange(0, 999999);

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('All clipboard copy attempts failed:', err);
    return false;
  }
}
