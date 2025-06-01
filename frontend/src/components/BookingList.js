import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import BookingForm from './BookingForm';
import './BookingList.css';
import 'react-datepicker/dist/react-datepicker.css';

export default function BookingList() {
  const PAGE_SIZE = 20;

  const [bookings, setBookings]     = useState([]);
  const [filter, setFilter]         = useState('today');
  const [customDate, setCustomDate] = useState(new Date());
  const [page, setPage]             = useState(0);
  const [hasMore, setHasMore]       = useState(false);
  const [editing, setEditing]       = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [expandedId, setExpandedId] = useState(null); // <-- добавлено состояние

  const FILTERS = {
    today:    () => ({ from: dayjs().startOf('day'),   to: dayjs().endOf('day') }),
    tomorrow: () => { const m = dayjs().add(1,'day');  return { from: m.startOf('day'), to: m.endOf('day') }; },
    week:     () => ({ from: dayjs().startOf('week'),  to: dayjs().endOf('week') }),
    custom:   d => ({ from: dayjs(d).startOf('day'),   to: dayjs(d).endOf('day') }),
    all:      () => null,
  };

  const loadBookings = useCallback(() => {
    api.get('/bookings', { params: { skip: page * PAGE_SIZE, limit: PAGE_SIZE } })
      .then(res => {
        let data = res.data.map(b => ({ ...b, dt: dayjs(b.booking_time) }));
        if (filter !== 'all') {
          const { from, to } = FILTERS[filter](customDate);
          data = data.filter(b => {
            const t = b.dt.valueOf();
            return t >= from.valueOf() && t <= to.valueOf();
          });
        }
        setBookings(data);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(console.error);
  }, [filter, customDate, page]);

  useEffect(() => { setPage(0); }, [filter, customDate]);
  useEffect(loadBookings, [loadBookings]);

  const headerLabel = () => {
    if (filter === 'today')   return 'сегодня';
    if (filter === 'tomorrow')return 'завтра';
    if (filter === 'week')    return 'на эту неделю';
    if (filter === 'custom')  return `на ${dayjs(customDate).format('DD-MM-YYYY')}`;
    return '';
  };

  const onFilterClick = key => {
    setFilter(key);
    setShowForm(false);
    setPage(0);
    setExpandedId(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Бронирования {headerLabel()}</h2>

      <button
        className="btn"
        onClick={() => {
          setShowForm(v => !v);
          setEditing(null);
          setExpandedId(null);
        }}
        style={{ marginBottom: 12 }}
      >
        {showForm ? 'Отменить' : 'Добавить бронь'}
      </button>

      {showForm && !editing && (
        <BookingForm onCreated={() => { loadBookings(); }} />
      )}
      {showForm && editing && (
        <BookingForm
          editableBooking={editing}
          onUpdate={() => { loadBookings(); setEditing(null); }}
        />
      )}

      <div className="filters">
        {['today','tomorrow','week','custom','all'].map(key => {
          const labels = {
            today: 'Сегодня',
            tomorrow: 'Завтра',
            week: 'На неделю',
            custom: 'Выбрать дату',
            all: 'Все'
          };
          return key !== 'custom' ? (
            <button
              key={key}
              className={`btn${filter === key ? ' active' : ''}`}
              onClick={() => onFilterClick(key)}
            >
              {labels[key]}
            </button>
          ) : (
            <DatePicker
              key="custom"
              selected={customDate}
              onChange={date => { setCustomDate(date); onFilterClick('custom'); }}
              customInput={
                <button className={`btn${filter === 'custom' ? ' active' : ''}`}>
                  Выбрать дату
                </button>
              }
              dateFormat="dd-MM-yyyy"
            />
          );
        })}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Время</th>
            <th>Гость</th>
            <th>Телефон</th>
            <th>Кол-во гостей</th>
            <th>Стол №</th>
            <th>Инстр.</th>
            <th>Комментарий</th>
            <th>Создатель</th>
            <th>Посещение</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <React.Fragment key={b.id}>
              <tr onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}>
                <td>
                  {filter === 'week'
                    ? b.dt.format('DD-MM HH:mm')
                    : b.dt.format('HH:mm')}
                </td>
                <td>{`${b.first_name} ${b.last_name}`}</td>
                <td>{b.phone}</td>
                <td style={{ textAlign: 'right' }}>{b.number_of_guests}</td>
                <td style={{ textAlign: 'right' }}>{b.table_number}</td>
                <td style={{ textAlign: 'center' }}>
                  {b.instructions_acknowledged ? 'Да' : 'Нет'}
                </td>
                <td>{b.extra_info || '—'}</td>
                <td>{b.created_by.full_name}</td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={b.arrived}
                    onChange={async () => {
                      await api.put(`/bookings/${b.id}`, {
                        ...b,
                        booking_time: b.dt.toISOString(),
                        arrived: !b.arrived
                      });
                      loadBookings();
                      setExpandedId(null);
                    }}
                  />
                </td>
              </tr>
              {expandedId === b.id && (
                <tr className="action-row">
                  <td colSpan={9}>
                    <button
                      className="btn"
                      onClick={() => {
                        setEditing(b);
                        setShowForm(true);
                        setExpandedId(null);
                      }}
                    >
                      Редактировать
                    </button>
                    <button
                      className="btn"
                      onClick={async () => {
                        if (!window.confirm('Удалить эту бронь?')) return;
                        await api.delete(`/bookings/${b.id}`);
                        loadBookings();
                        setExpandedId(null);
                      }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
        <button
          className="btn"
          onClick={() => setPage(p => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          ← Назад
        </button>
        <button
          className="btn"
          onClick={() => setPage(p => p + 1)}
          disabled={!hasMore}
        >
          Вперед →
        </button>
      </div>
    </div>
  );
}
