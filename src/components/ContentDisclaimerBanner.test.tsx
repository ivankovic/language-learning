import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContentDisclaimerBanner } from "./ContentDisclaimerBanner";

describe("ContentDisclaimerBanner", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders on first visit with a link to the issue tracker", () => {
    render(<ContentDisclaimerBanner />);
    expect(screen.getByText(/generated with the help of AI/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open an issue" })).toHaveAttribute(
      "href",
      "https://codeberg.org/ivankovic/language-learning/issues",
    );
  });

  it("dismissing hides it and persists the choice", () => {
    const { unmount } = render(<ContentDisclaimerBanner />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText(/generated with the help of AI/)).not.toBeInTheDocument();
    expect(localStorage.getItem("content-disclaimer-dismissed")).toBe("true");
    unmount();

    // Simulates a fresh mount on a later visit (e.g. after navigating away and back)
    render(<ContentDisclaimerBanner />);
    expect(screen.queryByText(/generated with the help of AI/)).not.toBeInTheDocument();
  });
});
