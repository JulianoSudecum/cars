import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './app/RootLayout';

const HomePage = lazy(() => import('./pages/HomePage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));
const NewCarPage = lazy(() => import('./pages/NewCarPage'));
const ComponentDocsPage = lazy(() => import('./pages/ComponentDocsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'assistente', element: <AssistantPage /> },
        { path: 'cadastrar', element: <NewCarPage /> },
        { path: 'componente', element: <ComponentDocsPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);
