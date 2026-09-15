import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';

const HomePage = lazy(() => import('@/pages/HomePage'));
const TracksPage = lazy(() => import('@/pages/TracksPage'));
const LevelPage = lazy(() => import('@/pages/LevelPage'));
const LessonPage = lazy(() => import('@/pages/LessonPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const ResultPage = lazy(() => import('@/pages/ResultPage'));
const ReviewPage = lazy(() => import('@/pages/ReviewPage'));
const CityPage = lazy(() => import('@/pages/CityPage'));
const ReferenceLayout = lazy(() => import('@/pages/ReferenceLayout'));
const ReferenceSummariesPage = lazy(() => import('@/pages/ReferenceSummariesPage'));
const ReferenceArticlePage = lazy(() => import('@/pages/ReferenceArticlePage'));
const ReferenceWordsPage = lazy(() => import('@/pages/ReferenceWordsPage'));
const ReferenceDialoguesPage = lazy(() => import('@/pages/ReferenceDialoguesPage'));
const StatsPage = lazy(() => import('@/pages/StatsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/tracks', element: <TracksPage /> },
      { path: '/tracks/:trackId/:levelId', element: <LevelPage /> },
      { path: '/lesson/:levelId/:slug', element: <LessonPage /> },
      { path: '/lesson/:levelId/:slug/quiz', element: <QuizPage /> },
      { path: '/lesson/:levelId/:slug/result', element: <ResultPage /> },
      { path: '/review', element: <ReviewPage /> },
      { path: '/city', element: <CityPage /> },
      {
        path: '/reference',
        element: <ReferenceLayout />,
        children: [
          { index: true, element: <Navigate to="summaries" replace /> },
          { path: 'summaries', element: <ReferenceSummariesPage /> },
          { path: 'summaries/:slug', element: <ReferenceArticlePage /> },
          { path: 'words', element: <ReferenceWordsPage /> },
          { path: 'dialogues', element: <ReferenceDialoguesPage /> },
        ],
      },
      { path: '/stats', element: <StatsPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/404', element: <NotFoundPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
];
