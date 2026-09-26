import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = process.env.SITE_URL ?? "https://ascension-motionwear.koundinya-shayan.chatgpt.site";
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/account`,
      queryParams: { access_type: "offline", prompt: "select_account" },
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${siteUrl}/account?auth_error=google`);
  }

  return NextResponse.redirect(data.url);
}
