import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      <p>Welcome to your dashboard!</p>
      <p>Here you'll see your clubs and upcomming club events. Get started by joining some <Link to="/clubs">clubs</Link>!</p>

    </div>
  );
}

export default Dashboard;