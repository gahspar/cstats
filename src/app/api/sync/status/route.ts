import { dataResponse } from "@/api/response";
import { hltvRepository } from "@/repositories/hltv.repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await hltvRepository.getSyncStatus();

  return dataResponse(data ?? { counts: {}, logs: [] });
}
