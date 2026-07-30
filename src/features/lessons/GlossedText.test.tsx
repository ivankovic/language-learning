import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { GlossedText } from "./GlossedText";
import type { DictionaryLookup } from "../../ai/dictionaryFallback";

const dictionary: DictionaryLookup = {
  lookup(word) {
    if (word.toLowerCase() === "ami") {
      return { translations: ["friend"], item: {} as never };
    }
    return null;
  },
};

describe("GlossedText", () => {
  it("renders unrecognized words as plain text", () => {
    const { container } = render(<GlossedText text="Mon chat est noir." dictionary={dictionary} />);
    expect(container.textContent).toBe("Mon chat est noir.");
    expect(container.querySelector('[role="button"]')).toBeNull();
  });

  it("makes a recognized word tappable, preserving surrounding punctuation", () => {
    const { container } = render(<GlossedText text="Mon ami, salut." dictionary={dictionary} />);
    const word = container.querySelector('[role="button"]');
    expect(word?.textContent).toBe("ami");
    expect(container.textContent).toBe("Mon ami, salut.");
  });

  it("reveals the translation on click, and hides it again on a second click", () => {
    const { container } = render(<GlossedText text="Mon ami est ici." dictionary={dictionary} />);
    const word = container.querySelector('[role="button"]')!;

    expect(container.textContent).not.toContain("friend");
    fireEvent.click(word);
    expect(container.textContent).toContain("friend");
    fireEvent.click(word);
    expect(container.textContent).not.toContain("friend");
  });

  it("reveals the translation on Enter/Space for keyboard users", () => {
    const { container } = render(<GlossedText text="ami" dictionary={dictionary} />);
    const word = container.querySelector('[role="button"]')!;
    fireEvent.keyDown(word, { key: "Enter" });
    expect(container.textContent).toContain("friend");
  });
});
