import type { GrammarLesson } from "../../types/content";
import vocabData from "./vocab.json";
import decksData from "./decks.json";
import courseData from "./course.json";
import unitsData from "./units.json";
import type { LoadedLanguageContent } from "../loader";
import { buildLanguageContent } from "../buildLanguageContent";

const lessonModules = import.meta.glob<{ default: GrammarLesson }>("./lessons/*.json", { eager: true });

export function loadCroatianContent(): LoadedLanguageContent {
  return buildLanguageContent(vocabData, decksData, courseData, unitsData, lessonModules);
}
