import React from 'react';
import { Link } from 'react-router-dom';

function AdminHomePage() {
  return (
    <div>
      <div className="topbar">
        <h1>TMS Admin</h1>
        <input type="search" placeholder="Search..." />
        <button onClick={() => console.log('Logout')}>Logout Icon</button>
      </div>
      <div className="sidebar">
        <ul>
          <li><Link to="/users">Users</Link></li>
          <li><Link to="/tasks">Tasks</Link></li>
          <li><Link to="/roles">Roles</Link></li>
          <li><Link to="/home">Home</Link></li>
        </ul>
      </div>
      <div className="content">
        {/* Add your page content here */}
      </div>
    </div>
  );
}

export default AdminHomePage;