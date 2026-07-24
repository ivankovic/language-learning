import { useState } from "react";
import { useT } from "../i18n/useT";

const DISMISSED_KEY = "content-disclaimer-dismissed";
const ISSUES_URL = "https://github.com/ivankovic/language-learning/issues";
const REPO_URL = "https://github.com/ivankovic/language-learning";

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function ContentDisclaimerBanner() {
  const t = useT();
  const [dismissed, setDismissed] = useState(isDismissed);

  if (dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      // ignore — worst case the banner reappears next visit
    }
    setDismissed(true);
  }

  return (
    <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/20">
      <div className="flex items-start justify-between gap-3">
        <p>
          {t("disclaimer.text")}{" "}
          <a href={ISSUES_URL} target="_blank" rel="noreferrer" className="underline">
            {t("disclaimer.openIssue")}
          </a>{" "}
          {t("disclaimer.or")}{" "}
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="underline">
            {t("disclaimer.pullRequest")}
          </a>{" "}
          {t("disclaimer.onGithub")}
        </p>
        <button
          onClick={dismiss}
          aria-label={t("disclaimer.dismissAria")}
          className="shrink-0 text-lg leading-none text-amber-700 dark:text-amber-300"
        >
          ×
        </button>
      </div>
    </div>
  );
}
