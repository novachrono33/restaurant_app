import React, { useState, useEffect } from 'react';
import api from '../../api';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';

const EditBookingModal = ({ booking, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    number_of_guests: 1,
    table_number: 1,
    booking_time: new Date(),
    instructions_acknowledged: false,
    extra_info: ''
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        ...booking,
        booking_time: dayjs(booking.booking_time).toDate()
      });
    }
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/bookings/${booking.id}`, {
        ...formData,
        booking_time: dayjs(formData.booking_time).toISOString()
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Редактировать бронирование</h2>
        <form onSubmit={handleSubmit}>
          {/* Поля формы аналогичны BookingForm */}
          <div className="form-actions">
            <button type="submit">Сохранить</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;
