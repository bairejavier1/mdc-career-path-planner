// src/utils.js
export function createPageUrl(pageName) {
  const map = {
    Home: "/",
    MyPathways: "/mypathways",
    PathwayResults: "/pathwayresults"
  };
  return map[pageName] || "/";
}
