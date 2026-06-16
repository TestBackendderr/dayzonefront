import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    const message = error?.message || '';

    if (/a0_0x|_0x[a-f0-9]{3,}/i.test(message)) {
      return null;
    }

    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const message = error?.message || '';

    if (/a0_0x|_0x[a-f0-9]{3,}/i.test(message)) {
      return;
    }

    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Что-то пошло не так</h1>
          <p>Обновите страницу или попробуйте войти снова.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Обновить
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
