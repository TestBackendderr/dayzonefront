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
import ContractsPage from './pages/Contracts/index';
import GroupContractsPage from './pages/GroupContracts/index';
import GroupKpkChatPage from './pages/GroupKpkChat/index';
import OrgKpkChatPage from './pages/OrgKpkChat/index';
import AlterEgoPage from './pages/AlterEgo/index';
import GroupMapsPage from './pages/GroupMaps/index';
import GroupInfoPage from './pages/GroupInfo/index';
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
          <Route path="/contracts" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <ContractsPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/group-contracts" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <GroupContractsPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/group-kpk-chat" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <GroupKpkChatPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/org-kpk-chat" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <OrgKpkChatPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/alter-ego" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <AlterEgoPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/group-maps" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <GroupMapsPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/group-info" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <GroupInfoPage />
              </main>
              <Footer />
            </ProtectedRoute>
          } />
          <Route path="/user-management" element={
            <ProtectedRoute>
              <Header />
              <main className="main-content">
                <LeftSide />
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
