import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Имитация запроса к серверу
    setTimeout(() => {
      // Проверка простых учетных данных для демо
      if (loginData.username === 'admin' && loginData.password === 'admin') {
        // Сохраняем состояние входа в localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({
          username: loginData.username,
          role: 'admin'
        }));
        
        // Переходим на главную страницу
        navigate('/');
      } else {
        alert('Неверный логин или пароль');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="radiation-overlay">
          <div className="radiation-symbol">☢</div>
          <div className="radiation-symbol">☢</div>
          <div className="radiation-symbol">☢</div>
          <div className="radiation-symbol">☢</div>
        </div>
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">DayZone</h1>
            <div className="login-subtitle">
              <span className="radiation-icon">☢</span>
              <span>Система управления сталкерами</span>
              <span className="radiation-icon">☢</span>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Логин</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={loginData.username}
                  onChange={handleInputChange}
                  placeholder="Введите логин"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleInputChange}
                  placeholder="Введите пароль"
                  required
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Запомнить меня
              </label>
              <a href="#" className="forgot-password">Забыли пароль?</a>
            </div>

            <button 
              type="submit" 
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Вход...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Войти в систему
                </>
              )}
            </button>

            <div className="demo-credentials">
              <p>Демо доступ:</p>
              <p><strong>Логин:</strong> admin</p>
              <p><strong>Пароль:</strong> admin</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
