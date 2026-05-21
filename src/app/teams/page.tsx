import { Suspense } from "react";
import { TeamsView } from "@/features/teams/teams-view";

export default function TeamsPage() {
  return (
    <Suspense fallback={null}>
      <TeamsView />
    </Suspense>
  );
}
