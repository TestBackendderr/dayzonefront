import React, { useState } from 'react';
import './IncomeExpense.scss';

const IncomeExpense = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOperation, setNewOperation] = useState({
    type: '+',
    amount: '',
    currency: 'рубли',
    source: ''
  });

  // Моковые данные последних операций
  const [operations] = useState([
    {
      id: 1,
      login: 'Снайпер',
      type: '+',
      amount: 5000,
      currency: 'рубли',
      source: 'Продажа артефактов'
    },
    {
      id: 2,
      login: 'Волк',
      type: '-',
      amount: 1500,
      currency: 'рубли',
      source: 'Покупка снаряжения'
    },
    {
      id: 3,
      login: 'Тень',
      type: '+',
      amount: 200,
      currency: '$',
      source: 'Заказ на разведку'
    },
    {
      id: 4,
      login: 'Охотник',
      type: '-',
      amount: 3000,
      currency: 'рубли',
      source: 'Ремонт оборудования'
    },
    {
      id: 5,
      login: 'Снайпер',
      type: '+',
      amount: 800,
      currency: '$',
      source: 'Награда за задание'
    }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOperation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Добавление операции:', newOperation);
    // Здесь будет логика отправки данных
    alert('Операция добавлена!');
    setNewOperation({
      type: '+',
      amount: '',
      currency: 'рубли',
      source: ''
    });
    setShowAddForm(false);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  return (
    <div className="income-expense">
      <div className="income-expense-header">
        <h2>Приход-расход</h2>
        <p>Управление финансовыми операциями сталкеров</p>
      </div>

      <div className="recent-operations">
        <h3>Последние операции</h3>
        <div className="operations-list">
          {operations.map(operation => (
            <div key={operation.id} className={`operation-item ${operation.type === '+' ? 'income' : 'expense'}`}>
              <div className="operation-login">
                <span className="login-name">{operation.login}</span>
              </div>
              <div className="operation-amount">
                <span className={`amount-sign ${operation.type === '+' ? 'positive' : 'negative'}`}>
                  {operation.type}
                </span>
                <span className="amount-value">{operation.amount}</span>
                <span className="amount-currency">{operation.currency}</span>
              </div>
              <div className="operation-source">
                <span className="source-text">{operation.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="add-operation-section">
        <button className="add-operation-btn" onClick={toggleAddForm}>
          <span className="btn-icon">💰</span>
          <span>Добавить приход-расход</span>
        </button>

        {showAddForm && (
          <div className="add-operation-form">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Тип операции</label>
                  <div className="type-buttons">
                    <button
                      type="button"
                      className={`type-btn ${newOperation.type === '+' ? 'active' : ''}`}
                      onClick={() => setNewOperation(prev => ({ ...prev, type: '+' }))}
                    >
                      <span className="type-icon">+</span>
                      Приход
                    </button>
                    <button
                      type="button"
                      className={`type-btn ${newOperation.type === '-' ? 'active' : ''}`}
                      onClick={() => setNewOperation(prev => ({ ...prev, type: '-' }))}
                    >
                      <span className="type-icon">-</span>
                      Расход
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Сумма</label>
                  <input
                    type="number"
                    name="amount"
                    value={newOperation.amount}
                    onChange={handleInputChange}
                    placeholder="Введите сумму"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Валюта</label>
                  <select
                    name="currency"
                    value={newOperation.currency}
                    onChange={handleInputChange}
                  >
                    <option value="рубли">Рубли</option>
                    <option value="$">Доллары</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Источник</label>
                <input
                  type="text"
                  name="source"
                  value={newOperation.source}
                  onChange={handleInputChange}
                  placeholder="Укажите источник операции"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn-submit">
                  <span className="btn-icon">☢</span>
                  Добавить операцию
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeExpense;

