// Minimal **bold** / *italic* + newline renderer — lesson explanation text
// doesn't need a full markdown library for Phase 1's content. The split
// regex tries **bold** before *italic* (alternation order matters — a greedy
// single-* pattern checked first would swallow one side of a ** pair).
const EMPHASIS = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

function renderEmphasis(text: string) {
  return text.split(EMPHASIS).map((part, k) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={k} className="text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={k} className="text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={k}>{part}</span>;
  });
}

export function MarkdownLite({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} className="mb-3 leading-relaxed text-slate-700 dark:text-slate-300">
          {para.split("\n").map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {renderEmphasis(line)}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}
