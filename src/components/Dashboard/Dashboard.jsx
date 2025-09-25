import React, { useState, useEffect } from 'react';
import './Dashboard.scss';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Завершить проект', completed: false, priority: 'high' },
    { id: 2, title: 'Встреча с командой', completed: true, priority: 'medium' },
    { id: 3, title: 'Изучить React', completed: false, priority: 'low' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Добро пожаловать в DayZone</h2>
        <div className="current-time">
          {currentTime.toLocaleTimeString('ru-RU')}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>Статистика задач</h3>
          <div className="stat">
            <span className="stat-number">{completedTasks}</span>
            <span className="stat-label">Выполнено</span>
          </div>
          <div className="stat">
            <span className="stat-number">{totalTasks - completedTasks}</span>
            <span className="stat-label">Осталось</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="recent-tasks">
          <h3>Последние задачи</h3>
          <div className="task-list">
            {tasks.slice(0, 3).map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <span className={`priority-dot ${task.priority}`}></span>
                <span className="task-title">{task.title}</span>
                <span className={`task-status ${task.completed ? 'done' : 'pending'}`}>
                  {task.completed ? '✓' : '○'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-actions">
          <h3>Быстрые действия</h3>
          <div className="action-buttons">
            <button className="action-btn primary">Добавить задачу</button>
            <button className="action-btn secondary">Просмотреть календарь</button>
            <button className="action-btn secondary">Настройки</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
