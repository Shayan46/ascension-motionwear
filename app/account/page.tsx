import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requestCancellation } from "./actions";

export const dynamic = "force-dynamic";

type OrderItem = { name: string; size?: string; quantity?: number };

function initials(name: string) {
  return name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0]?.toUpperCase()).join("");
}

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(cents / 100);
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.3Z"/>
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5L15.4 17c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/>
      <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z"/>
      <path fill="#EA4335" d="M12 6c1.5 0 2.9.5 4 1.6l2.7-2.7A9.1 9.1 0 0 0 12 2a10 10 0 0 0-8.9 5.5l3.3 2.6C7.2 7.8 9.4 6 12 6Z"/>
    </svg>
  );
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ notice?: string; auth_error?: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { notice, auth_error: authError } = await searchParams;

  if (!user) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-[#f4f1ea]">
        <nav className="flex h-20 items-center justify-between border-b border-white/15 px-5 md:px-12">
          <Link href="/" className="text-sm font-semibold tracking-[0.22em]">ASCENSION</Link>
          <Link href="/" className="text-xs uppercase tracking-[0.16em] text-white/65 hover:text-white">Back to shop</Link>
        </nav>
        <section className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-[1.15fr_.85fr]">
          <div className="flex flex-col justify-between border-b border-white/15 p-6 md:p-12 lg:border-b-0 lg:border-r">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Private account / State ID</p>
            <div className="my-16 max-w-3xl md:my-20">
              <h1 className="text-[clamp(4rem,11vw,9rem)] font-medium leading-[.8] tracking-[-.075em]">YOUR<br/>NEXT<br/><span className="text-white/35">STATE.</span></h1>
            </div>
            <p className="max-w-md text-base leading-7 text-white/55">Track every order, request changes and keep your ASCENSION wardrobe in one place.</p>
          </div>
          <div className="flex items-center p-6 md:p-12">
            <div className="w-full max-w-lg">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/45">Member access</p>
              <h2 className="text-4xl font-medium tracking-[-.04em] md:text-5xl">Enter your archive.</h2>
              <p className="mt-5 max-w-md leading-7 text-white/55">One account for your orders, saved states and early drop access.</p>
              {authError && <p role="alert" className="mt-7 border border-[#c7b99c] bg-[#c7b99c]/10 px-4 py-3 text-sm text-[#e6dcc8]">Google sign-in is awaiting final provider activation. Your account design is ready.</p>}
              <a href="/auth/google" className="mt-8 flex min-h-14 items-center justify-center gap-3 border border-white bg-white px-5 text-sm font-medium text-black transition hover:bg-transparent hover:text-white"><GoogleMark/> Continue with Google</a>
              <div className="my-7 flex items-center gap-4 text-[11px] uppercase tracking-[.16em] text-white/30"><span className="h-px flex-1 bg-white/15"/><span>or use mobile</span><span className="h-px flex-1 bg-white/15"/></div>
              <fieldset aria-describedby="phone-note" className="grid grid-cols-[5.5rem_1fr] gap-2">
                <label className="sr-only" htmlFor="country-code">Country code</label>
                <select id="country-code" disabled className="min-h-14 border border-white/25 bg-transparent px-3 text-sm text-white/55 disabled:cursor-not-allowed"><option className="text-black">+91</option></select>
                <label className="sr-only" htmlFor="phone-number">Phone number</label>
                <input id="phone-number" type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone number" disabled className="min-h-14 min-w-0 border border-white/25 bg-transparent px-4 text-base text-white placeholder:text-white/35 disabled:cursor-not-allowed"/>
              </fieldset>
              <div className="mt-2 grid grid-cols-6 gap-2" aria-label="OTP code fields">
                {[0,1,2,3,4,5].map((index) => <input key={index} aria-label={`OTP digit ${index + 1}`} inputMode="numeric" maxLength={1} disabled className="aspect-square min-w-0 border border-white/15 bg-white/[.03] text-center text-lg disabled:cursor-not-allowed"/>)}
              </div>
              <button type="button" disabled className="mt-3 min-h-12 w-full border border-white/15 text-xs uppercase tracking-[.15em] text-white/30 disabled:cursor-not-allowed">Send verification code</button>
              <p id="phone-note" className="mt-3 text-xs leading-5 text-white/35">Mobile OTP access is designed and will activate when the SMS service is connected.</p>
              <p className="mt-7 text-xs leading-5 text-white/35">By continuing, you agree to the <Link href="/terms" className="text-white/65 underline underline-offset-4 hover:text-white">Terms</Link> and acknowledge the <Link href="/privacy" className="text-white/65 underline underline-offset-4 hover:text-white">Privacy Policy</Link>.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const displayName = String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? "member");
  const orderRows = await getDb().select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));
  const activeOrders = orderRows.filter((order) => !["delivered", "cancelled"].includes(order.status));

  return (
    <main className="min-h-screen bg-[#f2f0ea] text-[#0a0a0a]">
      <nav className="flex min-h-20 items-center justify-between border-b border-black/15 px-5 py-4 md:px-12">
        <Link href="/" className="text-sm font-semibold tracking-[0.22em]">ASCENSION</Link>
        <div className="flex items-center gap-4 md:gap-8"><Link href="/#shop" className="text-xs uppercase tracking-[0.14em] text-black/60 hover:text-black">Shop</Link><form action="/auth/signout" method="post"><button type="submit" className="text-xs uppercase tracking-[0.14em] text-black/60 hover:text-black">Sign out</button></form></div>
      </nav>
      <section className="px-5 py-10 md:px-12 md:py-16">
        {notice === "cancellation-requested" && <p role="status" className="mb-8 border border-black bg-black px-4 py-3 text-sm text-white">Cancellation requested. We’ll confirm it by email.</p>}
        <div className="grid gap-10 border-b border-black/15 pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="text-xs uppercase tracking-[0.18em] text-black/45">State ID / {initials(displayName)}</p><h1 className="mt-4 text-[clamp(3.3rem,8vw,7.5rem)] font-medium leading-[.88] tracking-[-.065em]">Welcome back,<br/><span className="text-black/35">{displayName.split(" ")[0]}.</span></h1></div>
          <p className="max-w-sm text-sm leading-6 text-black/55">Signed in as {user.email ?? user.phone ?? "ASCENSION member"}. Your orders are private and linked to this account.</p>
        </div>
        <div className="grid border-b border-black/15 sm:grid-cols-3">
          <div className="border-b border-black/15 py-6 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0"><span className="text-4xl tracking-[-.04em]">{orderRows.length}</span><p className="mt-2 text-xs uppercase tracking-[0.14em] text-black/45">All orders</p></div>
          <div className="border-b border-black/15 py-6 sm:border-b-0 sm:border-r sm:px-6"><span className="text-4xl tracking-[-.04em]">{activeOrders.length}</span><p className="mt-2 text-xs uppercase tracking-[0.14em] text-black/45">In motion</p></div>
          <div className="py-6 sm:px-6"><span className="text-4xl tracking-[-.04em]">01</span><p className="mt-2 text-xs uppercase tracking-[0.14em] text-black/45">Member state</p></div>
        </div>
        <section className="py-12 md:py-16">
          <div className="mb-8"><p className="text-xs uppercase tracking-[0.18em] text-black/45">Order archive</p><h2 className="mt-2 text-3xl font-medium tracking-[-.04em] md:text-5xl">Your pieces in motion.</h2></div>
          {orderRows.length === 0 ? (
            <div className="grid min-h-80 place-items-center border border-black/20 bg-[#e8e5de] p-8 text-center"><div className="max-w-md"><p className="text-6xl font-light text-black/25">00</p><h3 className="mt-5 text-2xl font-medium tracking-[-.03em]">Your archive is clear.</h3><p className="mt-3 leading-7 text-black/55">Orders placed with this account will appear here with live status, tracking and available management options.</p><Link href="/#shop" className="mt-8 inline-flex min-h-12 items-center border border-black bg-black px-6 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-transparent hover:text-black">Explore State 01</Link></div></div>
          ) : (
            <div className="space-y-4">{orderRows.map((order) => {
              const items = JSON.parse(order.itemsJson) as OrderItem[];
              const canCancel = ["confirmed", "processing"].includes(order.status);
              return <article key={order.id} className="border border-black/20 bg-[#e8e5de] p-5 md:p-8"><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start"><div><div className="flex flex-wrap items-center gap-3"><h3 className="text-2xl font-medium tracking-[-.03em]">Order {order.orderNumber}</h3><span className="border border-black/30 px-2 py-1 text-[11px] uppercase tracking-[.12em]">{order.status.replaceAll("_", " ")}</span></div><p className="mt-2 text-sm text-black/50">Placed {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p><ul className="mt-5 space-y-1 text-sm">{items.map((item, index) => <li key={`${item.name}-${index}`}>{item.quantity ?? 1} × {item.name}{item.size ? ` / ${item.size}` : ""}</li>)}</ul></div><div className="lg:text-right"><p className="text-xl">{money(order.totalCents, order.currency)}</p>{order.trackingCode && <p className="mt-2 text-xs uppercase tracking-[.12em] text-black/45">Tracking {order.trackingCode}</p>}</div></div>{canCancel && <form action={requestCancellation} className="mt-7 border-t border-black/15 pt-5"><input type="hidden" name="orderId" value={order.id}/><button type="submit" className="min-h-11 border border-black px-4 text-xs uppercase tracking-[.14em] hover:bg-black hover:text-white">Request cancellation</button></form>}</article>;
            })}</div>
          )}
        </section>
      </section>
    </main>
  );
}
