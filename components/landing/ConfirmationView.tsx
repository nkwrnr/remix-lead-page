import type { PathType } from "@/lib/types";

export function ConfirmationView({
  path,
  city,
  zip,
}: {
  path: PathType;
  city: string | null;
  zip: string | null;
}) {
  const served = path === "served";
  return (
    <div className="animate-rise text-center py-6">
      <div className="vessel mx-auto h-16 w-16" aria-hidden />
      <h3 className="font-display text-3xl mt-6">
        {served ? <>You&apos;re <em>in.</em></> : <>Officially <em>on the map.</em></>}
      </h3>
      <p className="mt-3 text-ink-light max-w-md mx-auto">
        {served ? (
          <>
            We&apos;ll ping you the moment the next online drop goes live.
            Meanwhile, your Walmart{city ? ` in ${city}` : ""} is stocked — go grab
            a Paloma. 🥂
          </>
        ) : (
          <>
            Your zip{zip ? ` (${zip})` : ""} is now on record. The more people who
            raise their hand, the faster Remix shows up. We&apos;ll email you the
            second it does. Tell a thirsty friend?
          </>
        )}
      </p>
    </div>
  );
}
