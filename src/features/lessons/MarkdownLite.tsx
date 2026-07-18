// Minimal **bold** + newline renderer — lesson explanation text doesn't need
// a full markdown library for Phase 1's content.
export function MarkdownLite({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} className="mb-3 leading-relaxed text-slate-300">
          {para.split("\n").map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line.split(/(\*\*[^*]+\*\*)/g).map((part, k) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={k} className="text-slate-100">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <span key={k}>{part}</span>
                ),
              )}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}
