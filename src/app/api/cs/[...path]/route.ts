import { NextResponse } from "next/server";

const CS_API_BASE_URL = process.env.CS_API_BASE_URL ?? "https://api.csapi.de";
const allowedPrefixes = new Set([
  "counts",
  "fantasy",
  "maps",
  "matches",
  "players",
  "predict",
  "rankings",
  "sides",
  "status",
  "teams",
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const [resource] = path;

  if (!resource || !allowedPrefixes.has(resource)) {
    return NextResponse.json({ error: "Endpoint nao permitido" }, { status: 400 });
  }

  const endpoint = path.map(encodeURIComponent).join("/");
  const { search } = new URL(request.url);
  const upstream = `${CS_API_BASE_URL}/${endpoint}${search}`;

  try {
    const response = await fetch(upstream, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 5 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Falha ao consultar CS API", status: response.status },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json({ error: "CS API indisponivel" }, { status: 502 });
  }
}
