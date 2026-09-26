import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const siteUrl = process.env.SITE_URL ?? "https://ascension-motionwear.koundinya-shayan.chatgpt.site";
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${siteUrl}/`, { status: 303 });
}
