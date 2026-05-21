"use client";

import { useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useLocalStorage } from "@/hooks/use-local-storage";

export type FavoriteTeam = {
  teamId: number;
  teamName: string;
  rank?: number;
  createdAt: string;
};

export function useFavoriteTeams() {
  const [favorites, setFavorites] = useLocalStorage<FavoriteTeam[]>("cs-stats:favorites", []);

  const toggleFavorite = useCallback(
    async (team: { id: number; name: string; rank?: number }) => {
      const exists = favorites.some((favorite) => favorite.teamId === team.id);
      const next = exists
        ? favorites.filter((favorite) => favorite.teamId !== team.id)
        : [
            ...favorites,
            {
              teamId: team.id,
              teamName: team.name,
              rank: team.rank,
              createdAt: new Date().toISOString(),
            },
          ];

      setFavorites(next);

      if (supabase) {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (user) {
          if (exists) {
            await supabase
              .from("favorite_teams")
              .delete()
              .eq("user_id", user.id)
              .eq("team_id", team.id);
          } else {
            await supabase.from("favorite_teams").upsert({
              user_id: user.id,
              team_id: team.id,
              team_name: team.name,
            });
          }
        }
      }
    },
    [favorites, setFavorites],
  );

  const isFavorite = useCallback(
    (teamId: number) => favorites.some((favorite) => favorite.teamId === teamId),
    [favorites],
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
