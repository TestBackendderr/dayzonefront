import React, { useState } from 'react';
import './Calendar.scss';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Добавляем пустые ячейки для начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h2>Календарь</h2>
        <div className="calendar-controls">
          <button onClick={goToPreviousMonth} className="nav-btn">
            ‹
          </button>
          <h3>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button onClick={goToNextMonth} className="nav-btn">
            ›
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="day-names">
          {dayNames.map(day => (
            <div key={day} className="day-name">
              {day}
            </div>
          ))}
        </div>
        
        <div className="days-grid">
          {days.map((day, index) => (
            <div
              key={index}
              className={`day-cell ${day ? 'has-day' : 'empty'} ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
              onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="calendar-events">
        <h3>События на {selectedDate.toLocaleDateString('ru-RU')}</h3>
        <div className="events-list">
          <div className="event-item">
            <span className="event-time">10:00</span>
            <span className="event-title">Встреча с командой</span>
          </div>
          <div className="event-item">
            <span className="event-time">14:30</span>
            <span className="event-title">Презентация проекта</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
