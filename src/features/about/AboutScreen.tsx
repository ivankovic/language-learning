import { useNavigate } from "react-router-dom";
import { Screen } from "../../components/Screen";
import { useT } from "../../i18n/useT";

const REPO_URL = "https://github.com/ivankovic/language-learning";

export function AboutScreen() {
  const t = useT();
  const navigate = useNavigate();

  return (
    <Screen title={t("about.title")}>
      <button onClick={() => navigate(-1)} className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        {t("common.back")}
      </button>

      <p className="mb-6 text-slate-700 dark:text-slate-300">{t("about.intro")}</p>

      <section className="mb-6">
        <h2 className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">{t("about.free")}</h2>
        <p className="text-slate-700 dark:text-slate-300">{t("about.freeDesc")}</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">{t("about.private")}</h2>
        <p className="text-slate-700 dark:text-slate-300">{t("about.privateDesc")}</p>
      </section>

      <section className="mb-6">
        <h2 className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">{t("about.llmAssisted")}</h2>
        <p className="text-slate-700 dark:text-slate-300">{t("about.llmAssistedDesc")}</p>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-medium text-slate-600 dark:text-slate-400">{t("about.sourceCode")}</h2>
        <p className="text-slate-700 dark:text-slate-300">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-sky-600 underline dark:text-sky-400">
            {REPO_URL.replace("https://", "")}
          </a>
        </p>
      </section>
    </Screen>
  );
}
