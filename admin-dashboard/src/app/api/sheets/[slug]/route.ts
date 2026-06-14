import { NextResponse } from "next/server";

import { fetchSheet, isSheetSlug } from "@/lib/google-sheets";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  if (!isSheetSlug(slug)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Unknown sheet slug: ${slug}`,
        validSlugs: [
          "dashboard",
          "lead-tracker",
          "project-tracker",
          "solar3k-bids",
          "solar3k-contracts",
          "contractors-vendors",
          "financial-summary",
          "website-systems",
          "retail-ops",
          "calendar",
          "access-control",
        ],
      },
      { status: 404 },
    );
  }

  try {
    const result = await fetchSheet(slug);
    return NextResponse.json({
      ...result,
      metadata: {
        fetchedAt: result.syncedAt,
        status: "success",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ok: false,
        slug,
        error: message,
        metadata: {
          fetchedAt: new Date().toISOString(),
          status: "error",
        },
      },
      { status: 500 },
    );
  }
}
