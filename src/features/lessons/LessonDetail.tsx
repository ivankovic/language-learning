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
import type { Exercise } from "../../types/content";

export function LessonDetail() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [searchParams] = useSearchParams();
  const fromPractice = searchParams.get("practice") === "1";
  const navigate = useNavigate();
  const profile = useProfile();
  const lang = profile?.activeTargetLang;
  const content = useLanguageContent(lang);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const lesson = content?.lessons.find((l) => l.id === lessonId);

  useEffect(() => {
    if (lessonId && lang) startLesson(lessonId, lang);
  }, [lessonId, lang]);

  if (!content || !lesson) {
    return (
      <Screen title="Lesson">
        <p className="text-slate-600 dark:text-slate-400">Loading…</p>
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
    <Screen title={lesson.title}>
      {lesson.blocks.map((block, i) => {
        if (block.type === "explanation") {
          return <MarkdownLite key={i} text={block.markdown} />;
        }
        const exercise = exercisesById.get(block.exerciseId);
        if (!exercise) return null;
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
              <p className={`mt-2 text-sm ${results[exercise.id] ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {results[exercise.id] ? "Correct!" : "Not quite — added to your review deck."}
              </p>
            )}
          </div>
        );
      })}

      <Button className="w-full" disabled={!allAnswered} onClick={finishLesson}>
        Complete Lesson
      </Button>
    </Screen>
  );
}
