import { ErrorHandler, Injectable } from '@angular/core';

/**
 * Catches any runtime error Angular's change detection or a component throws and that
 * isn't already handled locally. Without this, an uncaught error inside a component's
 * template or lifecycle hook can leave the route content silently blank with the error
 * only visible in DevTools console - easy to miss, especially if you weren't already
 * looking there.
 *
 * This logs to console (always) AND renders a visible banner at the top of the page,
 * so "the page is empty and there's no error anywhere" becomes impossible.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    console.error('CareerPath AI runtime error:', error);
    this.renderVisibleBanner(error);
  }

  private renderVisibleBanner(error: unknown): void {
    const existing = document.getElementById('cpai-error-banner');
    if (existing) return; // don't stack duplicate banners on repeated errors

    const message = error instanceof Error ? error.message : String(error);

    const banner = document.createElement('div');
    banner.id = 'cpai-error-banner';
    banner.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      background: #C9483D; color: #fff; font-family: -apple-system, sans-serif;
      padding: 0.85rem 1.25rem; font-size: 0.85rem; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;
    banner.innerHTML = `
      <strong>Something broke while rendering this page.</strong>
      <span style="opacity: 0.9;"> ${this.escapeHtml(message)}</span>
      <span style="opacity: 0.75;"> &mdash; full details in the browser console (F12).</span>
    `;
    document.body.prepend(banner);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
