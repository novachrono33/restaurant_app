import React, { useState } from 'react';
import Login from './components/Login';
import BookingList from './components/BookingList';

function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('access_token'));

  return (
    <div style={{ padding: 20 }}>
      <h1>Restaurant Booking Client</h1>
      {authed
        ? <BookingList />
        : <Login onLoginSuccess={() => setAuthed(true)} />}
    </div>
  );
}

export default App;
