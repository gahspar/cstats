import { Suspense } from "react";
import { PlayersView } from "@/features/players/players-view";

export default function PlayersPage() {
  return (
    <Suspense fallback={null}>
      <PlayersView />
    </Suspense>
  );
}
