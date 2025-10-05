import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.scss';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import LeftSide from './components/LeftSide/LeftSide';
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
import UserManagement from './components/UserManagement/UserManagement';

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
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <Dashboard />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/add-stalker" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <AddStalkerPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/stalker-archive" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <StalkerArchivePage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/add-wanted" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <AddWantedPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/wanted-archive" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <WantedArchivePage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/income-expense" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <IncomeExpensePage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/finances" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <FinancesPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/user-management" element={
            <ProtectedRoute>
              <Header />
              <LeftSide />
              <main className="main-content">
                <UserManagement />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
