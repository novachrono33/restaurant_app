import React, { useEffect, useState } from 'react';
import api from '../api';

export default function BookingList() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/bookings/?skip=0&limit=100')
      .then(res => setBookings(res.data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Список бронирований</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th><th>Имя</th><th>Фамилия</th><th>Телефон</th>
            <th>Гостей</th><th>Стол</th><th>Инструкция</th><th>Кальян</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.first_name}</td>
              <td>{b.last_name}</td>
              <td>{b.phone}</td>
              <td>{b.number_of_guests}</td>
              <td>{b.table_number}</td>
              <td>{b.instructions_acknowledged ? 'Да' : 'Нет'}</td>
              <td>{b.hookah_needed ? 'Да' : 'Нет'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
