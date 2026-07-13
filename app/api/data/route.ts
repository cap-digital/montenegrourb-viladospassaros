import { NextResponse } from "next/server";

// Always run server-side and fresh — the client "Atualizar" button triggers a refetch.
export const dynamic = "force-dynamic";

const SUPABASE_URL =
  "https://cqrpbiepyeypbkizwacu.supabase.co/functions/v1/MontenegroUrb-VilaPassaros";
// Publishable (anon) key — safe to keep server-side; proxied so it never ships to the browser.
const SUPABASE_KEY = "sb_publishable_YN9YKLw6sludrgf9T2i_1g_Dcm8dIiK";

export async function GET() {
  try {
    const res = await fetch(SUPABASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Functions" }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream ${res.status}`, meta: [], google: [] },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "unknown",
        meta: [],
        google: [],
      },
      { status: 500 },
    );
  }
}
