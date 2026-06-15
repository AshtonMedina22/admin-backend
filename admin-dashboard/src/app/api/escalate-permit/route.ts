export const runtime = "edge";

type PermitEscalationPayload = {
  assetName?: string;
  brand?: string;
  authority?: string;
  permitId?: string;
  daysStale?: number;
};

function requiredText(value: unknown, fallback: string) {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

export async function POST(request: Request) {
  const token = request.headers.get("x-escalation-token");

  if (token !== process.env.PERMIT_ESCALATION_TOKEN) {
    return Response.json({ error: "Unauthorized escalation hook" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as PermitEscalationPayload;
    const assetName = requiredText(body.assetName, "Unknown asset");
    const brand = requiredText(body.brand, "Ops");
    const authority = requiredText(body.authority, "Unknown AHJ");
    const permitId = requiredText(body.permitId, "Unknown permit");
    const daysStale = Number(body.daysStale ?? 0);

    const generatedPrompt =
      `Draft an executive operational escalation letter for ${brand} regarding ${assetName} ` +
      `(Permit: ${permitId}). It has been stalled at ${authority} for ${daysStale} days.`;

    return Response.json({
      ok: true,
      status: "QUEUED_FOR_REVIEW",
      promptPreview: generatedPrompt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid escalation payload";
    return Response.json({ error: message }, { status: 400 });
  }
}
