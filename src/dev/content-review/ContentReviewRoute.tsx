import { Screen } from "../../components/Screen";

// Dev-only: reads whatever's staged in /content-staging via an absolute-from-
// project-root glob. This whole module is only reachable behind
// import.meta.env.DEV in router.tsx, so it (and this glob) never ships to
// production. Currently a placeholder — there's no staged content until the
// generation pipeline described in SPECS.md is actually run; Phase 1 shipped
// hand-authored seed content directly instead.
const stagedFiles = import.meta.glob("/content-staging/**/*.json", { eager: true });

export function ContentReviewRoute() {
  const entries = Object.entries(stagedFiles);

  return (
    <Screen title="Content Review (dev)">
      {entries.length === 0 ? (
        <p className="text-slate-400">
          No staged content yet. Generated content will appear here once the content-generation pipeline drops
          files into <code>content-staging/</code>.
        </p>
      ) : (
        <pre className="overflow-auto rounded-xl bg-slate-900 p-4 text-xs">
          {JSON.stringify(entries, null, 2)}
        </pre>
      )}
    </Screen>
  );
}
