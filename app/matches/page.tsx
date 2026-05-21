import { Suspense } from "react";
import { MatchesView } from "@/features/matches/matches-view";

export default function MatchesPage() {
  return (
    <Suspense fallback={null}>
      <MatchesView />
    </Suspense>
  );
}
