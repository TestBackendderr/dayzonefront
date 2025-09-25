import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!token || !storedAuth) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Проверяем токен на сервере
        await authAPI.verify();
        setIsAuthenticated(true);
      } catch (error) {
        // Токен недействителен, очищаем localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        <div>☢ Проверка авторизации...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Сохраняем текущий путь для перенаправления после входа
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
