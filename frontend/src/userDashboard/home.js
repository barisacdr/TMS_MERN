import React from 'react';
import { Link } from 'react-router-dom';

function UserHomePage() {
  return (
    <div>
      <div className="topbar">
        <h1>TMS User</h1>
        <input type="search" placeholder="Search..." />
        <button onClick={() => console.log('Logout')}>Logout Icon</button>
      </div>
      <div className="sidebar">
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/tasks">Tasks</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      </div>
      <div className="content">
        {/* Add your page content here */}
      </div>
    </div>
  );
}

export default UserHomePage;