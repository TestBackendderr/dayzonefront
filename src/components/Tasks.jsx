import React, { useState } from 'react';
import './Tasks.scss';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Завершить проект DayZone', completed: false, priority: 'high', dueDate: '2024-01-15' },
    { id: 2, title: 'Встреча с командой разработки', completed: true, priority: 'medium', dueDate: '2024-01-10' },
    { id: 3, title: 'Изучить новые возможности React', completed: false, priority: 'low', dueDate: '2024-01-20' },
    { id: 4, title: 'Оптимизировать производительность', completed: false, priority: 'high', dueDate: '2024-01-12' }
  ]);

  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        title: newTask,
        completed: false,
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0]
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  return (
    <div className="tasks">
      <div className="tasks-header">
        <h2>Управление задачами</h2>
        <div className="task-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Все
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Активные
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Завершенные
          </button>
        </div>
      </div>

      <div className="add-task">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Добавить новую задачу..."
          className="task-input"
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask} className="add-btn">
          Добавить
        </button>
      </div>

      <div className="task-list">
        {filteredTasks.map(task => (
          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-content">
              <span 
                className="task-checkbox"
                onClick={() => toggleTask(task.id)}
              >
                {task.completed ? '✓' : '○'}
              </span>
              <div className="task-info">
                <span className="task-title">{task.title}</span>
                <div className="task-meta">
                  <span className={`priority-badge ${task.priority}`}>
                    {task.priority === 'high' ? 'Высокий' : 
                     task.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                  <span className="due-date">
                    {new Date(task.dueDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
            <button 
              className="delete-btn"
              onClick={() => deleteTask(task.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="empty-state">
          <p>Нет задач для отображения</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
