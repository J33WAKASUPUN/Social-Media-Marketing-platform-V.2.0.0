import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows basic formatting tags only
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    // Force links to open in new tab and add security attributes
    ADD_ATTR: ['target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize plain text (remove all HTML tags)
 * Use this for content that should NOT contain any HTML
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true, // Keep text content but strip tags
  });
};

/**
 * Sanitize user input before displaying
 * Removes scripts, event handlers, and dangerous attributes
 */
export const sanitizeUserInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
};

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export const sanitizeURL = (url: string): string => {
  const sanitized = DOMPurify.sanitize(url, {
    ALLOWED_URI_REGEXP: /^(?:https?|ftp|mailto):/i,
  });
  
  // Additional check for dangerous protocols
  if (sanitized.match(/^(javascript|data|vbscript):/i)) {
    return '#';
  }
  
  return sanitized;
};