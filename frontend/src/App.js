import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, Link } from 'react-router-dom';
import Login from './loginPage/login';
import Register from './loginPage/register';
import UserHomePage from './userDashboard/home';
import AdminHomePage from './adminDashboard/adminHome';

function HomePage({ isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin }) {
  const navigate = useNavigate();

  if (isLoggedIn) {
    navigate('/home');
  }

  return <Login />;
}

function UserHome({ isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin }) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/');
  }

  return isAdmin ? <AdminHomePage /> : <UserHomePage />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<UserHome isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />} />
        </Routes>
        {!isLoggedIn && <Link to="/register">Register</Link>}
      </div>
    </Router>
  );
}

export default App;