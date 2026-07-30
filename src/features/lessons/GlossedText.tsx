import { useState } from "react";
import type { DictionaryLookup } from "../../ai/dictionaryFallback";

// Splits on whitespace but keeps it in the output so spacing is preserved.
const WORD_RE = /^\p{L}[\p{L}'-]*\p{L}$|^\p{L}$/u;

/** A word or phrase, with any recognized words made tappable to reveal their translation inline. Reuses the same DictionaryLookup as Journal mode's word helper — one lookup, wired into two surfaces. */
export function GlossedText({ text, dictionary }: { text: string; dictionary: DictionaryLookup }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <>
      {text.split(/(\s+)/).map((token, i) => {
        if (!token || /^\s+$/.test(token)) return token;

        const leading = token.match(/^[^\p{L}]*/u)?.[0] ?? "";
        const trailing = token.match(/[^\p{L}]*$/u)?.[0] ?? "";
        const core = token.slice(leading.length, token.length - trailing.length);

        const match = core && WORD_RE.test(core) ? dictionary.lookup(core) : null;
        if (!match) return <span key={i}>{token}</span>;

        return (
          <span key={i}>
            {leading}
            <span
              role="button"
              tabIndex={0}
              onClick={() => toggle(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(i);
                }
              }}
              className="cursor-pointer underline decoration-dotted decoration-slate-400 underline-offset-2 hover:decoration-sky-500 dark:decoration-slate-500 dark:hover:decoration-sky-400"
            >
              {core}
            </span>
            {revealed.has(i) && (
              <span className="mx-1 rounded bg-sky-100 px-1.5 py-0.5 text-xs font-normal text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                {match.translations.join(" / ")}
              </span>
            )}
            {trailing}
          </span>
        );
      })}
    </>
  );
}
