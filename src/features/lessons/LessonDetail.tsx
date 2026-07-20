import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import { useLanguageContent } from "../../hooks/useLanguageContent";
import { startLesson, recordExerciseResult, completeLesson } from "../../db/queries/lessonProgress";
import { getCardState, upsertCardState } from "../../db/queries/cardStates";
import { newCardState } from "../../srs/fsrs";
import { incrementToday } from "../../db/queries/activity";
import { loadSession, saveSession } from "../practice/sessionState";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { MarkdownLite } from "./MarkdownLite";
import { MultipleChoice } from "./exercises/MultipleChoice";
import { FillBlank } from "./exercises/FillBlank";
import { Reorder } from "./exercises/Reorder";
import { TranslateExercise } from "./exercises/TranslateExercise";
import { formatSolution } from "./exercises/checkAnswer";
import { useT } from "../../i18n/useT";
import { localizedLessonTitle, resolveExercise, resolveExplanationMarkdown } from "../../content/localize";
import type { Exercise } from "../../types/content";

export function LessonDetail() {
  const t = useT();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [searchParams] = useSearchParams();
  const fromPractice = searchParams.get("practice") === "1";
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const knownLang = profile?.knownLangs[0] ?? "en";
  const content = useLanguageContent(lang);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const lesson = content?.lessons.find((l) => l.id === lessonId);

  useEffect(() => {
    if (lessonId && lang) startLesson(lessonId, lang);
  }, [lessonId, lang]);

  if (!content || !lesson) {
    return (
      <Screen title={t("lessons.lessonFallbackTitle")}>
        <p className="text-slate-600 dark:text-slate-400">{t("common.loading")}</p>
      </Screen>
    );
  }

  const exercisesById = new Map(lesson.exercises.map((e) => [e.id, e]));
  const allAnswered = lesson.exercises.every((e) => e.id in results);

  async function handleAnswer(exercise: Exercise, correct: boolean) {
    setResults((r) => ({ ...r, [exercise.id]: correct }));
    if (lessonId) await recordExerciseResult(lessonId, exercise.id, correct);

    if (!correct && exercise.relatedItemId && lang) {
      const existing = await getCardState(exercise.relatedItemId);
      if (!existing) {
        await upsertCardState(newCardState(exercise.relatedItemId, lang));
      }
    }
  }

  async function finishLesson() {
    if (!lessonId || !lang) return;
    await completeLesson(lessonId);
    await incrementToday(lang, { lessonsCompleted: 1 });

    if (fromPractice) {
      const session = loadSession();
      if (session) saveSession({ ...session, lessonCompleted: true });
      navigate("/practice");
    } else {
      navigate("/lessons");
    }
  }

  return (
    <Screen title={localizedLessonTitle(lesson, knownLang)}>
      {lesson.blocks.map((block, i) => {
        if (block.type === "explanation") {
          return <MarkdownLite key={i} text={resolveExplanationMarkdown(block, knownLang)} />;
        }
        const baseExercise = exercisesById.get(block.exerciseId);
        if (!baseExercise) return null;
        const exercise = resolveExercise(baseExercise, knownLang);
        const answered = exercise.id in results;
        return (
          <div key={i} className="mb-6 rounded-xl bg-slate-100 dark:bg-slate-900/50 p-4">
            <p className="mb-3 font-medium">{exercise.prompt}</p>
            {exercise.type === "multiple-choice" && (
              <MultipleChoice exercise={exercise} onAnswer={(correct) => handleAnswer(exercise, correct)} />
            )}
            {exercise.type === "fill-blank" && (
              <FillBlank exercise={exercise} onAnswer={(correct) => handleAnswer(exercise, correct)} />
            )}
            {exercise.type === "reorder" && (
              <Reorder exercise={exercise} onAnswer={(correct) => handleAnswer(exercise, correct)} />
            )}
            {exercise.type === "translate" && (
              <TranslateExercise exercise={exercise} onAnswer={(correct) => handleAnswer(exercise, correct)} />
            )}
            {answered && (
              <div className="mt-2 text-sm">
                <p className={results[exercise.id] ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                  {results[exercise.id]
                    ? t("lessons.correct")
                    : exercise.relatedItemId
                      ? t("lessons.incorrectAddedToReview")
                      : t("lessons.incorrect")}
                </p>
                {!results[exercise.id] && (
                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    {t("lessons.correctAnswer")} <span className="font-medium">{formatSolution(exercise)}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      <Button className="w-full" disabled={!allAnswered} onClick={finishLesson}>
        {t("lessons.completeLesson")}
      </Button>
    </Screen>
  );
}
