const steps = [
  {
    title: "Add friends",
    description:
      "Name the people sharing the bill. You can add, rename, or remove friends at any time.",
  },
  {
    title: "Add receipts",
    description:
      "Create one receipt per physical bill. Set the printed total and the tax percentage.",
  },
  {
    title: "Assign costs",
    description:
      "For each line item, enter how much each person owes. Splits are entered per-person, per-item.",
  },
  {
    title: "Validate",
    description:
      "The validation panel shows the gap between the receipt's printed total and your entered subtotals. Aim for zero.",
  },
  {
    title: "Export",
    description:
      'Hit "Split Project!" to download a PNG summary and a JSON backup of the full project.',
  },
];

export function About() {
  return (
    <div className="flex-1 px-6 py-12 w-full max-w-2xl mx-auto">
      <div className="space-y-10">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-3">
            bill-splitter
          </h1>
          <p className="text-zinc-400 leading-relaxed text-sm">
            A browser-only tool for splitting bills with friends. No accounts,
            no servers — everything runs locally and persists in your browser.
          </p>
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-6">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Pages
          </p>

          <div className="space-y-5">
            <div>
              <p className="text-zinc-100 font-medium mb-1">Dashboard</p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Your home screen. Browse all your projects, create new ones, or
                import a project from a JSON backup. Projects are stored locally
                and survive page refreshes.
              </p>
            </div>

            <div>
              <p className="text-zinc-100 font-medium mb-1">Split View</p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                The active project workspace. Add receipts, fill in items and
                costs per person, then export the final breakdown when
                everyone's settled.
              </p>
            </div>
          </div>
        </div>

        <hr className="border-zinc-800" />

        <div className="space-y-6">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            How it works
          </p>

          <ol className="space-y-5">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="text-zinc-600 text-sm font-mono shrink-0 w-4 mt-0.5">
                  {i + 1}.
                </span>
                <p className="text-sm leading-relaxed">
                  <span className="text-zinc-200 font-medium">
                    {step.title}
                  </span>
                  <span className="text-zinc-400"> — {step.description}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-xs text-zinc-600">
          Made by{" "}
          <a
            href="https://hazriqpedia.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 transition-colors underline underline-offset-2"
          >
            Hazriq
          </a>
          . Thanks to Claude for the help.
        </p>
      </div>
    </div>
  );
}
