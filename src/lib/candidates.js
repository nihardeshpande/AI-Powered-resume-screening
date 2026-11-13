/**
 * Helpers for the session queue.
 *
 * A queue item is a file the reviewer picked in the browser.
 * This module never calculates a match score and never reads file contents.
 */

export const NOT_SCORED = "Not scored";
export const NOT_EXTRACTED = "Not extracted";
export const NOT_SCREENED = "Not screened";

export function formatFileSize(bytes) {
  if (typeof bytes !== "number" || Number.isNaN(bytes)) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function nextLocalId(queue) {
  const highest = queue.reduce((max, item) => {
    const match = /^LOCAL-(\d+)$/.exec(item.localId);
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  return `LOCAL-${String(highest + 1).padStart(3, "0")}`;
}

/**
 * Keep only fields this app actually collected.
 * Match score, experience, and skills are always cleared so a saved
 * browser session cannot display a number this app did not calculate.
 */
export function sanitizeQueue(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => {
      return (
        item &&
        typeof item.localId === "string" &&
        typeof item.fileName === "string" &&
        typeof item.size === "number" &&
        typeof item.roleId === "string"
      );
    })
    .map((item, index) => ({
      localId: item.localId,
      fileName: item.fileName,
      size: item.size,
      type: typeof item.type === "string" ? item.type : "",
      roleId: item.roleId,
      addedOrder: Number.isInteger(item.addedOrder) ? item.addedOrder : index,
      matchScore: null,
      relevantExperience: null,
      keySkills: null,
      classification: NOT_SCREENED,
    }));
}

export function filterCandidates(candidates, { query, roleId, roleTitleFor }) {
  const needle = query.trim().toLowerCase();

  return candidates.filter((candidate) => {
    // "all" keeps every role. An empty roleId means Unassigned.
    if (roleId !== "all" && (candidate.roleId || "") !== (roleId || "")) {
      return false;
    }

    if (!needle) return true;

    const roleName = roleTitleFor(candidate.roleId);
    const haystack = [candidate.localId, candidate.fileName, roleName, candidate.classification]
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });
}

/**
 * Sort by match score when a score exists.
 * Blank scores stay in the order the files were added.
 * They are not given a rank.
 */
export function sortByMatchScore(candidates, direction) {
  const copy = [...candidates];

  copy.sort((a, b) => {
    const scoreA = typeof a.matchScore === "number" ? a.matchScore : null;
    const scoreB = typeof b.matchScore === "number" ? b.matchScore : null;

    if (scoreA === null && scoreB === null) {
      return a.addedOrder - b.addedOrder;
    }
    if (scoreA === null) return 1;
    if (scoreB === null) return -1;
    if (scoreA === scoreB) return a.addedOrder - b.addedOrder;

    return direction === "asc" ? scoreA - scoreB : scoreB - scoreA;
  });

  return copy;
}

export function countByRole(candidates, roleId) {
  return candidates.filter((candidate) => candidate.roleId === roleId).length;
}
