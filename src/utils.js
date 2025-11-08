export function createPageUrl(path) {
  // simple helper to build a page path
  return `${window.location.origin}/${path.replace(/^\//, "")}`;
}
