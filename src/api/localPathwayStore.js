const STORAGE_KEY = "savedPathways";

export function listPathways() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function createPathway(pathway) {
  const all = listPathways();
  const newPath = {
    id: Date.now().toString(),
    created_date: new Date().toISOString(),
    ...pathway
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...all, newPath]));
  return newPath;
}

export function updatePathway(id, data) {
  const all = listPathways();
  const index = all.findIndex(p => p.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all[index];
}

export function getPathway(id) {
  return listPathways().find(p => p.id === id);
}

export function filterPathways(query) {
  return listPathways().filter(p => p.id === query.id);
}