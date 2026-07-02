import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch(err => {
  // If Angular fails to bootstrap (e.g. a provider/config error), the page would
  // otherwise stay completely blank with the real cause buried in the console.
  // Make it impossible to miss.
  console.error('CareerPath AI failed to start:', err);

  const root = document.querySelector('app-root') ?? document.body;
  root.innerHTML = `
    <div style="font-family: -apple-system, sans-serif; max-width: 640px; margin: 4rem auto; padding: 1.5rem; border: 1px solid #e3ddd0; border-radius: 8px; background: #fff;">
      <h1 style="font-size: 1.1rem; color: #c9483d; margin: 0 0 0.75rem;">CareerPath AI failed to start</h1>
      <p style="color: #444; font-size: 0.9rem; margin: 0 0 1rem;">
        Open the browser DevTools Console (F12) for the full error. A common cause is
        a TypeScript/template compile error - check the terminal where <code>npm start</code>
        is running for the real message.
      </p>
      <pre style="white-space: pre-wrap; font-size: 0.8rem; background: #faf7f0; padding: 0.75rem; border-radius: 4px; overflow: auto;">${String(err?.message ?? err)}</pre>
    </div>
  `;
});
