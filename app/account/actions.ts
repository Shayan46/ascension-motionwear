"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requestCancellation(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account");
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) redirect("/account?notice=missing-order");

  await getDb()
    .update(orders)
    .set({ status: "cancellation_requested", cancelledAt: new Date() })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.userId, user.id),
        inArray(orders.status, ["confirmed", "processing"]),
      ),
    );

  revalidatePath("/account");
  redirect("/account?notice=cancellation-requested");
}
