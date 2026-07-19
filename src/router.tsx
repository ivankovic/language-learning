import { HashRouter, Routes, Route, Outlet } from "react-router-dom";
import { BottomTabBar } from "./components/BottomTabBar";
import { HomeScreen } from "./features/home/HomeScreen";
import { LessonTree } from "./features/lessons/LessonTree";
import { LessonDetail } from "./features/lessons/LessonDetail";
import { JournalList } from "./features/journal/JournalList";
import { JournalEntryScreen } from "./features/journal/JournalEntryScreen";
import { ProgressScreen } from "./features/progress/ProgressScreen";
import { SettingsScreen } from "./features/settings/SettingsScreen";
import { AboutScreen } from "./features/about/AboutScreen";
import { PracticeSession } from "./features/practice/PracticeSession";
import { FlashcardReview } from "./features/review/FlashcardReview";

function TabLayout() {
  return (
    <>
      <Outlet />
      <BottomTabBar />
    </>
  );
}

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<TabLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/lessons" element={<LessonTree />} />
          <Route path="/journal" element={<JournalList />} />
          <Route path="/progress" element={<ProgressScreen />} />
        </Route>
        <Route path="/lessons/:lessonId" element={<LessonDetail />} />
        <Route path="/journal/new" element={<JournalEntryScreen />} />
        <Route path="/journal/:entryId" element={<JournalEntryScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/about" element={<AboutScreen />} />
        <Route path="/practice" element={<PracticeSession />} />
        <Route path="/review" element={<FlashcardReview mode="extra" />} />
        {import.meta.env.DEV && (
          <Route
            path="/dev/content-review"
            element={
              // Lazy so this whole subtree (and its import.meta.glob) is
              // dead-code-eliminated from production builds.
              <LazyContentReview />
            }
          />
        )}
      </Routes>
    </HashRouter>
  );
}

import { lazy, Suspense } from "react";
const ContentReviewRoute = lazy(() =>
  import("./dev/content-review/ContentReviewRoute").then((m) => ({ default: m.ContentReviewRoute })),
);
function LazyContentReview() {
  return (
    <Suspense fallback={null}>
      <ContentReviewRoute />
    </Suspense>
  );
}
