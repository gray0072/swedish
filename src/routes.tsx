import { Navigate, type RouteObject } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import HomePage from '@/pages/HomePage';
import TracksPage from '@/pages/TracksPage';
import LevelPage from '@/pages/LevelPage';
import LessonPage from '@/pages/LessonPage';
import QuizPage from '@/pages/QuizPage';
import ResultPage from '@/pages/ResultPage';
import ReviewPage from '@/pages/ReviewPage';
import CityPage from '@/pages/CityPage';
import StatsPage from '@/pages/StatsPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

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
      { path: '/stats', element: <StatsPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/404', element: <NotFoundPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
];
