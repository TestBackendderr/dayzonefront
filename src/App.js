import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.scss';
import Header from './components/Header/Header';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoginPage from './pages/Login/index';
import MainPage from './pages/MainPage/MainPage';
import Dashboard from './components/Dashboard/Dashboard';
import AddStalkerPage from './pages/AddStalker/index';
import StalkerArchivePage from './pages/StalkerArchive/index';
import AddWantedPage from './pages/AddWanted/index';
import WantedArchivePage from './pages/WantedArchive/index';
import IncomeExpensePage from './pages/IncomeExpense/index';
import FinancesPage from './pages/Finances/index';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <MainPage />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <Dashboard />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/add-stalker" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <AddStalkerPage />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/stalker-archive" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <StalkerArchivePage />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/add-wanted" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <AddWantedPage />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/wanted-archive" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <WantedArchivePage />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/income-expense" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <IncomeExpensePage />
              </main>
            </ProtectedRoute>
          } />
          <Route path="/finances" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <FinancesPage />
              </main>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
