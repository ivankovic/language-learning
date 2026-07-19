import { useNavigate } from "react-router-dom";
import { Screen } from "../../components/Screen";

const REPO_URL = "https://codeberg.org/ivankovic/language-learning";

export function AboutScreen() {
  const navigate = useNavigate();

  return (
    <Screen title="About">
      <button onClick={() => navigate(-1)} className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        ← Back
      </button>

      <p className="mb-6 text-slate-700 dark:text-slate-300">
        Language Learning is a flashcard, grammar, and journaling app for learning languages — built to be free,
        private, and open.
      </p>

      <section className="mb-6">
        <h2 className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">Free</h2>
        <p className="text-slate-700 dark:text-slate-300">
          No cost, no subscription, no account required. The source code is licensed under the GNU AGPLv3.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">Private</h2>
        <p className="text-slate-700 dark:text-slate-300">
          There's no server — everything runs entirely in your browser. Your progress, journal entries, and
          settings are stored only on this device and are never sent anywhere. Back them up anytime from Settings.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">LLM-assisted</h2>
        <p className="text-slate-700 dark:text-slate-300">
          The app's vocabulary, translations, and grammar lessons were generated with the help of AI (large
          language models) and may contain mistakes. If you spot one, corrections are very welcome — see the
          source link below.
        </p>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">Source code</h2>
        <p className="text-slate-700 dark:text-slate-300">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-sky-600 underline dark:text-sky-400">
            {REPO_URL.replace("https://", "")}
          </a>
        </p>
      </section>
    </Screen>
  );
}
