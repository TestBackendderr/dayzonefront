import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при изменении данных
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(loginData.username, loginData.password);
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Переходим на главную страницу
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка входа в систему');
    } finally {
      setIsLoading(false);
    }
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

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

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
              <p><strong>Пароль:</strong> password</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
