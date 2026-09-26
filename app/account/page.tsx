import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from "@/app/chatgpt-auth";
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

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const user = await getChatGPTUser();
  const { notice } = await searchParams;

  if (!user) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-[#f4f1ea]">
        <nav className="flex h-20 items-center justify-between border-b border-white/15 px-5 md:px-12">
          <a href="/" className="text-sm font-semibold tracking-[0.22em]">ASCENSION</a>
          <a href="/" className="text-xs uppercase tracking-[0.16em] text-white/65 hover:text-white">Back to shop</a>
        </nav>
        <section className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-[1.15fr_.85fr]">
          <div className="flex flex-col justify-between border-b border-white/15 p-6 md:p-12 lg:border-b-0 lg:border-r">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Private account / State ID</p>
            <div className="my-20 max-w-3xl">
              <h1 className="text-[clamp(4rem,11vw,9rem)] font-medium leading-[.8] tracking-[-.075em]">YOUR<br/>NEXT<br/><span className="text-white/35">STATE.</span></h1>
            </div>
            <p className="max-w-md text-base leading-7 text-white/55">Track every order, request changes and keep your ASCENSION wardrobe in one place.</p>
          </div>
          <div className="flex items-center p-6 md:p-12">
            <div className="w-full max-w-lg">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/45">Member access</p>
              <h2 className="text-4xl font-medium tracking-[-.04em] md:text-5xl">Sign in to your archive.</h2>
              <p className="mt-5 max-w-md leading-7 text-white/55">Secure access uses your ChatGPT identity. ASCENSION never stores a password.</p>
              <a href={chatGPTSignInPath("/account")} target="_top" className="mt-10 flex min-h-14 items-center justify-between border border-white bg-white px-5 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-transparent hover:text-white">
                Sign in with ChatGPT <span aria-hidden="true">↗</span>
              </a>
              <p className="mt-4 text-xs leading-5 text-white/35">By continuing, you’ll return to your private order dashboard.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const orderRows = await getDb().select().from(orders)
    .where(eq(orders.userId, user.userId)).orderBy(desc(orders.createdAt));
  const activeOrders = orderRows.filter((order) => !["delivered", "cancelled"].includes(order.status));

  return (
    <main className="min-h-screen bg-[#f2f0ea] text-[#0a0a0a]">
      <nav className="flex min-h-20 items-center justify-between border-b border-black/15 px-5 py-4 md:px-12">
        <a href="/" className="text-sm font-semibold tracking-[0.22em]">ASCENSION</a>
        <div className="flex items-center gap-4 md:gap-8">
          <a href="/#shop" className="text-xs uppercase tracking-[0.14em] text-black/60 hover:text-black">Shop</a>
          <a href={chatGPTSignOutPath("/")} target="_top" className="text-xs uppercase tracking-[0.14em] text-black/60 hover:text-black">Sign out</a>
        </div>
      </nav>

      <section className="px-5 py-10 md:px-12 md:py-16">
        {notice === "cancellation-requested" && (
          <p role="status" className="mb-8 border border-black bg-black px-4 py-3 text-sm text-white">Cancellation requested. We’ll confirm it by email.</p>
        )}
        <div className="grid gap-10 border-b border-black/15 pb-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-black/45">State ID / {initials(user.displayName)}</p>
            <h1 className="mt-4 text-[clamp(3.3rem,8vw,7.5rem)] font-medium leading-[.88] tracking-[-.065em]">Welcome back,<br/><span className="text-black/35">{user.fullName?.split(" ")[0] ?? "member"}.</span></h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-black/55">Signed in as {user.email}. Your orders are private and linked to this account.</p>
        </div>

        <div className="grid border-b border-black/15 sm:grid-cols-3">
          <div className="border-b border-black/15 py-6 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0"><span className="text-4xl tracking-[-.04em]">{orderRows.length}</span><p className="mt-2 text-xs uppercase tracking-[0.14em] text-black/45">All orders</p></div>
          <div className="border-b border-black/15 py-6 sm:border-b-0 sm:border-r sm:px-6"><span className="text-4xl tracking-[-.04em]">{activeOrders.length}</span><p className="mt-2 text-xs uppercase tracking-[0.14em] text-black/45">In motion</p></div>
          <div className="py-6 sm:px-6"><span className="text-4xl tracking-[-.04em]">01</span><p className="mt-2 text-xs uppercase tracking-[0.14em] text-black/45">Member state</p></div>
        </div>

        <section className="py-12 md:py-16">
          <div className="mb-8"><p className="text-xs uppercase tracking-[0.18em] text-black/45">Order archive</p><h2 className="mt-2 text-3xl font-medium tracking-[-.04em] md:text-5xl">Your pieces in motion.</h2></div>
          {orderRows.length === 0 ? (
            <div className="grid min-h-80 place-items-center border border-black/20 bg-[#e8e5de] p-8 text-center">
              <div className="max-w-md"><p className="text-6xl font-light text-black/25">00</p><h3 className="mt-5 text-2xl font-medium tracking-[-.03em]">Your archive is clear.</h3><p className="mt-3 leading-7 text-black/55">Orders placed with this account will appear here with live status, tracking and available management options.</p><a href="/#shop" className="mt-8 inline-flex min-h-12 items-center border border-black bg-black px-6 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-transparent hover:text-black">Explore State 01</a></div>
            </div>
          ) : (
            <div className="space-y-4">
              {orderRows.map((order) => {
                const items = JSON.parse(order.itemsJson) as OrderItem[];
                const canCancel = ["confirmed", "processing"].includes(order.status);
                return (
                  <article key={order.id} className="border border-black/20 bg-[#e8e5de] p-5 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
                      <div><div className="flex flex-wrap items-center gap-3"><h3 className="text-2xl font-medium tracking-[-.03em]">Order {order.orderNumber}</h3><span className="border border-black/30 px-2 py-1 text-[11px] uppercase tracking-[.12em]">{order.status.replaceAll("_", " ")}</span></div><p className="mt-2 text-sm text-black/50">Placed {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p><ul className="mt-5 space-y-1 text-sm">{items.map((item, index) => <li key={`${item.name}-${index}`}>{item.quantity ?? 1} × {item.name}{item.size ? ` / ${item.size}` : ""}</li>)}</ul></div>
                      <div className="lg:text-right"><p className="text-xl">{money(order.totalCents, order.currency)}</p>{order.trackingCode && <p className="mt-2 text-xs uppercase tracking-[.12em] text-black/45">Tracking {order.trackingCode}</p>}</div>
                    </div>
                    {canCancel && <form action={requestCancellation} className="mt-7 border-t border-black/15 pt-5"><input type="hidden" name="orderId" value={order.id}/><button type="submit" className="min-h-11 border border-black px-4 text-xs uppercase tracking-[.14em] hover:bg-black hover:text-white">Request cancellation</button></form>}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
