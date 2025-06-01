// frontend/src/components/BookingForm.js

import React, { useState, useEffect } from 'react';
import api from '../api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

export default function BookingForm({ onCreated, editableBooking, onUpdate }) {
  const init = editableBooking
    ? {
        first_name: editableBooking.first_name,
        last_name:  editableBooking.last_name,
        phone:      editableBooking.phone || '',
        number_of_guests: editableBooking.number_of_guests,
        table_number:     editableBooking.table_number,
        instructions_acknowledged: editableBooking.instructions_acknowledged,
        booking_time: new Date(editableBooking.booking_time),
        extra_info: editableBooking.extra_info || '',
      }
    : {
        first_name: '',
        last_name:  '',
        phone:      '',
        number_of_guests: '',
        table_number:     '',
        instructions_acknowledged: false,
        booking_time: new Date(),
        extra_info: '',
      };

  const [data, setData] = useState(init);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(init);
    setError('');
  }, [editableBooking]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    if (name === 'phone') {
      // если поле пустое и вводится цифра — добавляем '+'
      const raw = value;
      if (raw === '') {
        setData(d => ({ ...d, phone: '' }));
      } else {
        const prefix = raw[0] === '+' ? '' : '+';
        setData(d => ({ ...d, phone: prefix + raw.replace(/\D/g, '') }));
      }
    } else {
      setData(d => ({ ...d, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleDate = date => setData(d => ({ ...d, booking_time: date }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    const payload = {
      ...data,
      booking_time: dayjs(data.booking_time).toISOString(),
    };
    try {
      if (editableBooking) {
        const res = await api.put(`/bookings/${editableBooking.id}`, payload);
        onUpdate(res.data);
      } else {
        await api.post('/bookings', payload);
        onCreated();
        setData(init);
      }
    } catch {
      setError('Ошибка при сохранении бронирования');
    }
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 20, maxWidth: 500 }}>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

      <label>
        Имя гостя<br/>
        <input
          name="first_name"
          placeholder="Иван"
          value={data.first_name}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom:10 }}
        />
      </label>

      <label>
        Фамилия гостя<br/>
        <input
          name="last_name"
          placeholder="Петров"
          value={data.last_name}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom:10 }}
        />
      </label>

      <label>
        Телефон<br/>
        <input
          name="phone"
          placeholder="+7..."
          value={data.phone}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom:10 }}
        />
      </label>

      <div style={{ display:'flex', gap:10, marginBottom:10 }}>
        <label style={{ flex:1 }}>
          Гостей<br/>
          <input
            name="number_of_guests"
            type="number"
            min="1"
            placeholder="1"
            value={data.number_of_guests}
            onChange={handleChange}
            required
            style={{ width:'100%' }}
          />
        </label>
        <label style={{ flex:1 }}>
          Стол №<br/>
          <input
            name="table_number"
            type="number"
            min="1"
            placeholder="1"
            value={data.table_number}
            onChange={handleChange}
            required
            style={{ width:'100%' }}
          />
        </label>
      </div>

      <label style={{ marginBottom:10, display:'block' }}>
        Время визита<br/>
        <DatePicker
          selected={data.booking_time}
          onChange={handleDate}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="HH:mm dd-MM-yyyy"
          placeholderText="Выберите дату и время"
          style={{ width: '100%' }}
        />
      </label>

      <label style={{ marginBottom:10, display:'block' }}>
        Доп. информация<br/>
        <textarea
          name="extra_info"
          rows={3}
          placeholder="Например: День Рождения"
          value={data.extra_info}
          onChange={handleChange}
          style={{ width:'100%' }}
        />
      </label>

      <label style={{ marginBottom:10 }}>
        <input
          name="instructions_acknowledged"
          type="checkbox"
          checked={data.instructions_acknowledged}
          onChange={handleChange}
        /> Ознакомлен(а) с инструкциями
      </label>

      <button type="submit" className="btn">
        {editableBooking ? 'Обновить бронь' : 'Сохранить бронь'}
      </button>
    </form>
  );
}
