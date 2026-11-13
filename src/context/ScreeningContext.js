"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { roles } from "@/data/jobs";
import { nextLocalId, NOT_SCREENED, sanitizeQueue } from "@/lib/candidates";

const ScreeningContext = createContext(null);

function emptyChoices() {
  return Object.fromEntries(
    roles.filter((role) => role.experience.conflict).map((role) => [role.id, ""]),
  );
}

export function ScreeningProvider({ children }) {
  const [choices, setChoices] = useState(emptyChoices);
  const [queue, setQueue] = useState([]);

  const api = useMemo(() => {
    function setExperienceChoice(roleId, sourceId) {
      setChoices((current) => ({ ...current, [roleId]: sourceId }));
    }

    function addFiles(fileList, roleId) {
      const files = Array.from(fileList || []);
      if (files.length === 0) return 0;

      setQueue((current) => {
        const next = [...current];
        let order = current.reduce((max, item) => Math.max(max, item.addedOrder), -1) + 1;

        for (const file of files) {
          next.push({
            localId: nextLocalId(next),
            fileName: file.name,
            size: file.size,
            type: file.type || "",
            roleId: roleId || "",
            addedOrder: order,
            matchScore: null,
            relevantExperience: null,
            keySkills: null,
            classification: NOT_SCREENED,
          });
          order += 1;
        }

        return sanitizeQueue(next);
      });

      return files.length;
    }

    function removeFromQueue(localId) {
      setQueue((current) => current.filter((item) => item.localId !== localId));
    }

    function clearQueue() {
      setQueue([]);
    }

    return {
      choices,
      queue,
      setExperienceChoice,
      addFiles,
      removeFromQueue,
      clearQueue,
    };
  }, [choices, queue]);

  return <ScreeningContext.Provider value={api}>{children}</ScreeningContext.Provider>;
}

export function useScreening() {
  const value = useContext(ScreeningContext);
  if (!value) {
    throw new Error("useScreening must be used inside ScreeningProvider");
  }
  return value;
}
