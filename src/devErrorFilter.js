const isInjectedError = (error, source) => {
  const message = error?.message || String(error || '');

  if (/a0_0x|_0x[a-f0-9]{3,}/i.test(message)) {
    return true;
  }

  if (!source || source === '<anonymous>' || source === 'undefined') {
    return /is not defined/i.test(message);
  }

  return /^(chrome|moz|safari)-extension:/.test(source);
};

const removeWebpackOverlay = () => {
  document
    .querySelectorAll(
      'iframe[id*="webpack"], iframe[src*="webpack"], #webpack-dev-server-client-overlay'
    )
    .forEach((node) => node.remove());
};

window.addEventListener(
  'error',
  (event) => {
    const message = event.message || event.error?.message || '';
    if (isInjectedError({ message }, event.filename)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  },
  true
);

window.addEventListener(
  'unhandledrejection',
  (event) => {
    const reason = event.reason;
    const message = reason?.message || reason;
    if (isInjectedError({ message }, '')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true
);

const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.map(String).join(' ');
  if (isInjectedError({ message }, '')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

if (process.env.NODE_ENV === 'development') {
  try {
    const { stopReportingRuntimeErrors } = require('react-error-overlay');
    stopReportingRuntimeErrors();
  } catch (_) {
    // react-error-overlay is only available in development builds
  }

  removeWebpackOverlay();
  new MutationObserver(removeWebpackOverlay).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  const hook = window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__;
  if (hook) {
    hook.onRuntimeError = () => {};
    hook.onRuntimeSuccess = () => {};
  }
}
