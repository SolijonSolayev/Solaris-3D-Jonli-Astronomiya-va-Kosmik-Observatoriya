import { StrictMode, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { UzbekScriptSelector } from './components/UzbekScriptSelector';
import { observeUzbekScript } from './utils/uzbekScript';
import './index.css';

const rootElement = document.getElementById('root')!;
observeUzbekScript(rootElement);

createRoot(rootElement).render(
  <StrictMode>
    <Fragment>
      <App />
      <UzbekScriptSelector />
    </Fragment>
  </StrictMode>,
);
