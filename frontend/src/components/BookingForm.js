// frontend/src/components/BookingForm.js

import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * BookingForm
 *
 * Props:
 * - onCreated: function to call after creating a new booking
 * - editableBooking: (optional) existing booking object to edit
 * - onUpdate: function(updatedBooking) to call after updating
 */
export default function BookingForm({ onCreated, editableBooking, onUpdate }) {
  // If editing, initialize form with existing booking data
  const initialData = editableBooking
    ? {
        first_name: editableBooking.first_name,
        last_name: editableBooking.last_name,
        phone: editableBooking.phone,
        number_of_guests: editableBooking.number_of_guests,
        table_number: editableBooking.table_number,
        instructions_acknowledged: editableBooking.instructions_acknowledged,
        booking_time: new Date(editableBooking.booking_time),
        extra_info: editableBooking.extra_info || '',
      }
    : {
        first_name: '',
        last_name: '',
        phone: '',
        number_of_guests: 1,
        table_number: 1,
        instructions_acknowledged: false,
        booking_time: new Date(),
        extra_info: '',
      };

  const [data, setData] = useState(initialData);
  const [error, setError] = useState('');
  const phoneRef = useRef(null);

  // If editableBooking changes (e.g. switching from create to edit), reset form
  useEffect(() => {
    setData(initialData);
    setError('');
  }, [editableBooking]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhoneChange = e => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('9')) v = '7' + v;
    if (v.length > 11) v = v.slice(0, 11);

    let fmt = '+' + v[0];
    if (v.length > 1) fmt += ' (' + v.slice(1, 4);
    if (v.length >= 4) fmt += ') ' + v.slice(4, 7);
    if (v.length >= 7) fmt += '-' + v.slice(7, 9);
    if (v.length >= 9) fmt += '-' + v.slice(9, 11);

    setData(prev => ({ ...prev, phone: fmt }));
  };

  const handleDateChange = date => {
    setData(prev => ({ ...prev, booking_time: date }));
  };

  const submit = async e => {
    e.preventDefault();
    setError('');
    const payload = {
      ...data,
      booking_time: dayjs(data.booking_time).toISOString(),
    };

    try {
      if (editableBooking) {
        // Update existing
        const res = await api.put(`/bookings/${editableBooking.id}`, payload);
        onUpdate(res.data);
      } else {
        // Create new
        await api.post('/bookings/', payload);
        onCreated();
        // reset form
        setData({
          first_name: '',
          last_name: '',
          phone: '',
          number_of_guests: 1,
          table_number: 1,
          instructions_acknowledged: false,
          booking_time: new Date(),
          extra_info: '',
        });
      }
    } catch {
      setError('Ошибка при сохранении бронирования');
    }
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 20, maxWidth: 500 }}>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

      <div style={{ marginBottom: 10 }}>
        <label>
          Имя гостя<br/>
          <input
            name="first_name"
            value={data.first_name}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          Фамилия гостя<br/>
          <input
            name="last_name"
            value={data.last_name}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          Телефон<br/>
          <input
            ref={phoneRef}
            name="phone"
            value={data.phone}
            onChange={handlePhoneChange}
            placeholder="+7 (___) ___-__-__"
            required
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <label style={{ flex: 1 }}>
          Гостей<br/>
          <input
            name="number_of_guests"
            type="number"
            min="1"
            value={data.number_of_guests}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </label>

        <label style={{ flex: 1 }}>
          Стол №<br/>
          <input
            name="table_number"
            type="number"
            min="1"
            value={data.table_number}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          Время визита<br/>
          <DatePicker
            selected={data.booking_time}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="HH:mm dd-MM-yyyy"
            placeholderText="Выберите дату и время"
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          Доп. информация<br/>
          <textarea
            name="extra_info"
            rows={3}
            value={data.extra_info}
            onChange={handleChange}
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          <input
            name="instructions_acknowledged"
            type="checkbox"
            checked={data.instructions_acknowledged}
            onChange={handleChange}
          /> Ознакомлен(а) с инструкциями
        </label>
      </div>

      <button type="submit">
        {editableBooking ? 'Обновить бронь' : 'Сохранить бронь'}
      </button>
    </form>
  );
}
