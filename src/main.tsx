import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill getBoundingClientRect for sandbox / iframe compatibility
const defaultGetBoundingClientRect = function (this: any) {
  const w = typeof window !== 'undefined' ? window.innerWidth || 1200 : 1200;
  const h = typeof window !== 'undefined' ? window.innerHeight || 800 : 800;
  return {
    top: 0,
    left: 0,
    bottom: h,
    right: w,
    width: w,
    height: h,
    x: 0,
    y: 0,
    toJSON: () => {},
  };
};

if (typeof window !== 'undefined') {
  if (typeof Element !== 'undefined' && !Element.prototype.getBoundingClientRect) {
    Element.prototype.getBoundingClientRect = defaultGetBoundingClientRect;
  }
  if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.getBoundingClientRect) {
    HTMLElement.prototype.getBoundingClientRect = defaultGetBoundingClientRect;
  }
  if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.getBoundingClientRect) {
    HTMLCanvasElement.prototype.getBoundingClientRect = defaultGetBoundingClientRect;
  }

  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const origCreateElement = document.createElement;
    document.createElement = function (tagName: string, options?: ElementCreationOptions) {
      const el = origCreateElement.call(document, tagName, options);
      if (el && typeof el.getBoundingClientRect !== 'function') {
        (el as any).getBoundingClientRect = defaultGetBoundingClientRect;
      }
      return el;
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

