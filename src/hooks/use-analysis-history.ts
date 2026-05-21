"use client";

import { useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { BettingSuggestion } from "@/types/platform";

export type SavedAnalysis = {
  id: string;
  suggestion: BettingSuggestion;
  createdAt: string;
};

export function useAnalysisHistory() {
  const [history, setHistory] = useLocalStorage<SavedAnalysis[]>("cs-stats:analysis-history", []);

  const saveAnalysis = useCallback(
    async (suggestion: BettingSuggestion) => {
      const entry = {
        id: `${suggestion.id}-${Date.now()}`,
        suggestion,
        createdAt: new Date().toISOString(),
      };

      setHistory([entry, ...history].slice(0, 30));

      if (supabase) {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (user) {
          await supabase.from("analysis_history").insert({
            user_id: user.id,
            inputs: {
              match: suggestion.match,
              market: suggestion.market,
            },
            result: suggestion,
          });
        }
      }

      return entry;
    },
    [history, setHistory],
  );

  return {
    history,
    saveAnalysis,
  };
}
