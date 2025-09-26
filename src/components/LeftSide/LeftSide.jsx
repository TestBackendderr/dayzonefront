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

  const handleAddWanted = () => {
    navigate('/add-wanted');
  };

  const handleWantedArchive = () => {
    navigate('/wanted-archive');
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
          
          
          <button className="stalker-btn add-wanted-btn" onClick={handleAddWanted}>
            <div className="btn-icon">
              <span className="add-wanted-icon">⚠</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">Добавь в розыск</span>
          </button>
          
          <button className="stalker-btn wanted-archive-btn" onClick={handleWantedArchive}>
            <div className="btn-icon">
              <span className="wanted-archive-icon">🔍</span>
              <span className="radiation-icon">☢</span>
            </div>
            <span className="btn-text">База розыска</span>
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
