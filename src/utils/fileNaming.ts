/**
 * Utility functions for user-controlled custom file naming across all PDF and image tools.
 */

/**
 * Strips invalid filesystem characters: / \ : * ? " < > |
 * Also removes leading/trailing spaces and trailing periods.
 */
export function sanitizeFileName(name: string, fallback = 'toolcrest-document'): string {
  if (!name) return fallback;
  // Remove dangerous or invalid filesystem characters
  let clean = name.replace(/[/\\:*?"<>|]/g, '').trim();
  // Remove duplicate spaces
  clean = clean.replace(/\s+/g, ' ');
  // Remove trailing periods and spaces
  clean = clean.replace(/[. ]+$/, '');
  return clean || fallback;
}

/**
 * Appends the specified extension, preventing duplicate extensions (e.g. preventing 'file.pdf.pdf').
 */
export function ensureFileExtension(name: string, targetExt: string): string {
  const ext = targetExt.startsWith('.') ? targetExt.slice(1) : targetExt;
  let clean = sanitizeFileName(name);

  // If user typed the extension at the end (e.g. "report.pdf"), strip it first to prevent duplicates
  const extRegex = new RegExp(`\\.${ext}$`, 'i');
  clean = clean.replace(extRegex, '');

  return `${clean}.${ext}`;
}

/**
 * Generates an intuitive suggested default filename without extension based on the source file name and tool.
 */
export function getSuggestedDefaultFileName(
  originalFileName?: string,
  toolSlug?: string,
  suffix = 'processed'
): string {
  const base = originalFileName
    ? originalFileName.replace(/\.[^/.]+$/, '').trim()
    : 'document';

  const cleanBase = sanitizeFileName(base, 'document');

  if (!toolSlug) {
    return `${cleanBase}_${suffix}`;
  }

  // Generate clean readable action suffixes
  const slugSuffixMap: Record<string, string> = {
    'merge-pdf': 'merged',
    'split-pdf': 'split',
    'compress-pdf': 'compressed',
    'web-optimize-pdf': 'optimized',
    'rotate-pdf': 'rotated',
    'remove-pdf-pages': 'edited',
    'extract-pdf-pages': 'extracted',
    'rearrange-pdf': 'rearranged',
    'add-watermark': 'watermarked',
    'add-page-numbers': 'numbered',
    'images-to-pdf': 'converted',
    'pdf-to-images': 'pages_images',
    'extract-pdf-images': 'extracted_images',
    'sign-pdf': 'signed',
    'protect-pdf': 'protected',
    'unlock-pdf': 'unlocked',
    'redact-pdf': 'redacted',
    'create-pdf': 'created',
    'webpage-to-pdf': 'webpage_export',
    'compare-pdfs': 'comparison_report',
  };

  const action = slugSuffixMap[toolSlug] || toolSlug.replace(/-/g, '_');
  return `${cleanBase}_${action}`;
}
