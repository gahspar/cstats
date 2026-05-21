import type { GetEventsArguments } from "hltv";
import type { NormalizedEvent } from "@/types/hltv";
import { hltvClient } from "./client";
import { normalizeEvent } from "./normalizers";
import { dedupe, withRetry } from "./service-utils";

export const hltvEventsService = {
  async getEvents(args?: GetEventsArguments): Promise<NormalizedEvent[]> {
    return dedupe(`hltv:events:${JSON.stringify(args ?? {})}`, () =>
      withRetry(
        async () => {
          const events = await hltvClient.getEvents(args);
          return events.flatMap((event) => {
            const normalized = normalizeEvent(event);
            return normalized ? [normalized] : [];
          });
        },
        { service: "events", method: "getEvents", args },
      ),
    );
  },
};
