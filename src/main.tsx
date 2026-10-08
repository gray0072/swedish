import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { markUpdateReady, watchForUpdates } from './lib/appUpdate';
import './styles/index.css';

// A new version waits until the learner is off a quiz — see lib/appUpdate.ts.
const updateSW = registerSW({
  onNeedRefresh: () => markUpdateReady(() => updateSW()),
  onRegisteredSW: (_url, registration) => registration && watchForUpdates(registration),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
