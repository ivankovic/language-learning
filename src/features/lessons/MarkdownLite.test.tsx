import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MarkdownLite } from "./MarkdownLite";

describe("MarkdownLite", () => {
  it("renders **bold** as <strong>", () => {
    const { container } = render(<MarkdownLite text="This is **bold** text." />);
    const strong = container.querySelector("strong");
    expect(strong?.textContent).toBe("bold");
  });

  it("renders *italic* as <em>, not literal asterisks", () => {
    const { container } = render(<MarkdownLite text="Sono *andato* al mercato." />);
    const em = container.querySelector("em");
    expect(em?.textContent).toBe("andato");
    expect(container.textContent).not.toContain("*");
  });

  it("handles both **bold** and *italic* in the same line without cross-matching", () => {
    const { container } = render(<MarkdownLite text="**Bold** and *italic* together." />);
    expect(container.querySelector("strong")?.textContent).toBe("Bold");
    expect(container.querySelector("em")?.textContent).toBe("italic");
    expect(container.textContent).not.toContain("*");
  });

  it("splits paragraphs on blank lines and single newlines into <br>", () => {
    const { container } = render(<MarkdownLite text={"Para one.\n\nPara two, line one.\nline two."} />);
    expect(container.querySelectorAll("p")).toHaveLength(2);
    expect(container.querySelectorAll("br")).toHaveLength(1);
  });
});
