import { getLeadStore } from "@/lib/leads/factory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dev/QA-only admin: shows captured leads from the local store.
 * Gated by ADMIN_TOKEN (?token=...). Disabled entirely in production unless a token is set.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const expected = process.env.ADMIN_TOKEN || "dev";

  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_TOKEN) {
    return <Locked reason="Admin is disabled in production (no ADMIN_TOKEN set)." />;
  }
  if (token !== expected) {
    return <Locked reason="Add ?token=… to view captured leads." />;
  }

  const store = getLeadStore();
  const leads = await store.list();

  return (
    <main className="mx-auto max-w-5xl p-6 font-sans">
      <h1 className="text-2xl font-bold mb-1">Captured leads</h1>
      <p className="text-ink-light mb-4">
        {leads.length} total · source: {store.name}
      </p>
      <div className="overflow-x-auto rounded-card border border-line">
        <table className="w-full text-sm">
          <thead className="bg-paper-2 text-left">
            <tr>
              {["Created", "Email", "Zip", "Served", "Store", "Product", "UTM src", "Campaign", "Consent"].map(
                (h) => (
                  <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className="px-3 py-2 whitespace-nowrap">{l.createdAt.replace("T", " ").slice(0, 19)}</td>
                <td className="px-3 py-2">{l.email}</td>
                <td className="px-3 py-2">{l.zip ?? "—"}</td>
                <td className="px-3 py-2">{l.served ? "✅" : "—"}</td>
                <td className="px-3 py-2">{l.matchedStore ?? "—"}</td>
                <td className="px-3 py-2">{l.productInterest}</td>
                <td className="px-3 py-2">{l.utmSource ?? "—"}</td>
                <td className="px-3 py-2">{l.utmCampaign ?? "—"}</td>
                <td className="px-3 py-2">{l.consent ? "yes" : "no"}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-ink-light">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Locked({ reason }: { reason: string }) {
  return (
    <main className="mx-auto max-w-md p-10 text-center font-sans">
      <h1 className="text-xl font-bold mb-2">🔒 Admin</h1>
      <p className="text-ink-light">{reason}</p>
    </main>
  );
}
