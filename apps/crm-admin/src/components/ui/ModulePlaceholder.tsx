interface ModulePlaceholderProps {
  title: string;
  description: string;
  plannedPhase: string;
  routePath: string;
  sharedContractItems?: readonly string[];
  sharedContractLabel?: string;
}

export function ModulePlaceholder({
  title,
  description,
  plannedPhase,
  routePath,
  sharedContractItems,
  sharedContractLabel,
}: ModulePlaceholderProps) {
  return (
    <section className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-600/20">
            Not Implemented · {plannedPhase}
          </span>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">{title}</h2>
        </div>
        <code className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
          {routePath}
        </code>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{description}</p>

      {sharedContractItems && sharedContractItems.length > 0 && (
        <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {sharedContractLabel ?? "@techop/shared Contract"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sharedContractItems.map((item) => (
              <span
                key={item}
                className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
