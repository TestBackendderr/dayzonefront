import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LeftSide.scss';

const LeftSide = () => {
  const navigate = useNavigate();

  const handleAddStalker = () => {
    navigate('/add-stalker');
  };

  const handleArchiveStalkers = () => {
    navigate('/stalker-archive');
  };

  const handleIncomeExpense = () => {
    navigate('/income-expense');
  };

  const handleFinances = () => {
    navigate('/finances');
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const handleAddSearch = () => {
    navigate('/add-search');
  };

  return (
    <div className="left-side">
      <div className="left-side-content">
        <div className="stalker-buttons">
          <button className="stalker-btn archive-btn" onClick={handleArchiveStalkers}>
            <div className="btn-icon">
              <span className="list-icon">☰</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Архив сталкеров</span>
          </button>
          
          <button className="stalker-btn add-btn" onClick={handleAddStalker}>
            <div className="btn-icon">
              <span className="plus-icon">+</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Добавь сталкеров</span>
          </button>
          
          <button className="stalker-btn income-expense-btn" onClick={handleIncomeExpense}>
            <div className="btn-icon">
              <span className="money-icon">💰</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Приход-расход</span>
          </button>
          
          <button className="stalker-btn add-search-btn" onClick={handleAddSearch}>
            <div className="btn-icon">
              <span className="add-search-icon">⚠</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Добавить в розыск</span>
          </button>
          
          <button className="stalker-btn search-btn" onClick={handleSearch}>
            <div className="btn-icon">
              <span className="search-icon">🔍</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Розыск</span>
          </button>
          
          <button className="stalker-btn finances-btn" onClick={handleFinances}>
            <div className="btn-icon">
              <span className="chart-icon">📊</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Финансы</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftSide;
