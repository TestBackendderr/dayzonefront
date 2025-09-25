import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.scss';
import Header from './components/Header/Header';
import MainPage from './pages/MainPage/MainPage';
import Dashboard from './components/Dashboard/Dashboard';
import AddStalkerPage from './pages/AddStalker/index';
import StalkerArchivePage from './pages/StalkerArchive/index';
import AddSearchPage from './pages/AddSearch/index';
import SearchPage from './pages/Search/index';
import IncomeExpensePage from './pages/IncomeExpense/index';
import FinancesPage from './pages/Finances/index';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-stalker" element={<AddStalkerPage />} />
            <Route path="/stalker-archive" element={<StalkerArchivePage />} />
            <Route path="/add-search" element={<AddSearchPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/income-expense" element={<IncomeExpensePage />} />
            <Route path="/finances" element={<FinancesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
