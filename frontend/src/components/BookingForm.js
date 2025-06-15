import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import './BookingForm.css';

export default function BookingForm({ onCreated, editableBooking, onUpdate, onClose }) {
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
        table_number: '',
        instructions_acknowledged: false,
        booking_time: new Date(),
        extra_info: '',
      };
  const monthNames = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  const [data, setData] = useState(init);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    setData(init);
    setError('');
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [editableBooking, onClose]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'first_name' || name === 'last_name') {
      if (/^[a-zA-Zа-яА-ЯёЁ\s-]*$/.test(value)) {
        setData(d => ({ ...d, [name]: value }));
      }
    } 
    else if (name === 'phone') {
      if (value.length <= 12) {
        setData(d => ({ ...d, [name]: value.replace(/[^0-9+]/g, '') }));
      }
    }
    else {
      setData(d => ({ ...d, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleDate = (date) => {
  if (date.getHours() === 0 && date.getMinutes() === 0) {
    const prevTime = data.booking_time;
    date.setHours(prevTime.getHours());
    date.setMinutes(prevTime.getMinutes());
  }
  setData(d => ({ ...d, booking_time: date }));
};

  const submit = async e => {
    e.preventDefault();
    setError('');
    
    if (!data.first_name || !data.last_name || !data.phone || 
        !data.number_of_guests || !data.table_number) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    const payload = {
      ...data,
      booking_time: dayjs(data.booking_time).toISOString(),
    };
    
    try {
      if (editableBooking) {
        const res = await api.patch(`/bookings/${editableBooking.id}`, payload);
        onUpdate(res.data);
      } else {
        await api.post('/bookings', payload);
        onCreated();
      }
      onClose();
    } catch (err) {
      setError('Ошибка при сохранении бронирования');
      console.error(err);
    }
  };

  return (
    <div className="mini-form" ref={formRef}>
      <form onSubmit={submit} className="mini-form__form">
        <div className="form-header">
          <h3>{editableBooking ? 'Редактировать бронь' : 'Новая бронь'}</h3>
          <button type="button" className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        
        {error && <div className="mini-form__error">{error}</div>}

        <div className="mini-form__row">
          <div className="mini-form__field">
            <label>Имя *</label>
            <input
              name="first_name"
              placeholder="Иван"
              value={data.first_name}
              onChange={handleChange}
              required
              pattern="[A-Za-zА-Яа-яЁё\s-]+"
              title="Только буквы, пробелы и дефисы"
              className="mini-form__input"
            />
          </div>
          
          <div className="mini-form__field">
            <label>Фамилия *</label>
            <input
              name="last_name"
              placeholder="Петров"
              value={data.last_name}
              onChange={handleChange}
              required
              pattern="[A-Za-zА-Яа-яЁё\s-]+"
              title="Только буквы, пробелы и дефисы"
              className="mini-form__input"
            />
          </div>
        </div>

        <div className="mini-form__row">
          <div className="mini-form__field">
            <label>Телефон *</label>
            <input
              name="phone"
              placeholder="+79991234567"
              value={data.phone}
              onChange={handleChange}
              required
              className="mini-form__input"
              maxLength={20}
            />
          </div>
        </div>

        <div className="mini-form__row">
          <div className="mini-form__field">
            <label>Дата и время *</label>
            <DatePicker
              selected={data.booking_time}
              onChange={handleDate}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd.MM.yyyy HH:mm"
              minDate={new Date()}
              className="mini-form__input"
              popperPlacement="bottom-start"
              popperContainer={({ children }) => (
              <div className="date-picker-wrapper">
                {children}
              </div>
            )}
            renderCustomHeader={({
              date,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled
            }) => (
              <div className="custom-datepicker-header">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    decreaseMonth();
                  }}
                  disabled={prevMonthButtonDisabled}
                  className="custom-nav-button"
                >
                  &#8592;
                </button>
                <span>
                  {monthNames[date.getMonth()]} {date.getFullYear()}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    increaseMonth();
                  }}
                  disabled={nextMonthButtonDisabled}
                  className="custom-nav-button"
                >
                  &#8594;
                </button>
              </div>
            )}
            />
          </div>
        </div>

        <div className="mini-form__row">
          <div className="mini-form__field">
            <label>Гостей *</label>
            <input
              name="number_of_guests"
              type="number"
              min="1"
              placeholder="1"
              value={data.number_of_guests}
              onChange={handleChange}
              required
              className="mini-form__input"
            />
          </div>
          
          <div className="mini-form__field">
            <label>Стол № *</label>
            <input
              name="table_number"
              type="number"
              min="1"
              placeholder="1"
              value={data.table_number}
              onChange={handleChange}
              required
              className="mini-form__input"
            />
          </div>
        </div>

        <div className="mini-form__field">
          <label>Комментарий</label>
          <textarea
            name="extra_info"
            rows={2}
            placeholder="Например: День Рождения"
            value={data.extra_info}
            onChange={handleChange}
            className="mini-form__textarea"
          />
        </div>

        <div className="mini-form__checkbox">
          <input
            id="instructions"
            name="instructions_acknowledged"
            type="checkbox"
            checked={data.instructions_acknowledged}
            onChange={handleChange}
          />
          <label htmlFor="instructions">Ознакомлен(а) с инструкциями</label>
        </div>

        <button type="submit" className="mini-form__submit">
          {editableBooking ? 'Обновить бронь' : 'Создать бронь'}
        </button>
      </form>
    </div>
  );
}