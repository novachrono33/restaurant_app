import React, { useEffect, useState } from 'react';
import api from '../api';
import dayjs from 'dayjs';
import BookingForm from './BookingForm';
import './BookingList.css';

export default function BookingList() {
  const [bookings, setBookings]       = useState([]);
  const [filter, setFilter]           = useState('today');
  const [customDate, setCustomDate]   = useState(dayjs().format('YYYY-MM-DD'));
  const [editing, setEditing]         = useState(null);
  const [showForm, setShowForm]       = useState(false);
  const [expandedId, setExpandedId]   = useState(null);

  const FILTERS = {
    today:    () => ({ from: dayjs().startOf('day'),      to: dayjs().endOf('day') }),
    tomorrow: () => { const m = dayjs().add(1,'day');     return { from: m.startOf('day'), to: m.endOf('day') }; },
    week:     () => ({ from: dayjs().startOf('day'),      to: dayjs().add(7,'day').endOf('day') }),
    custom:   d  => ({ from: dayjs(d).startOf('day'),      to: dayjs(d).endOf('day') }),
  };

  // Загрузка и фильтрация
  useEffect(() => {
    api.get('/bookings')
      .then(res => {
        const { from, to } = filter==='custom'
          ? FILTERS.custom(customDate)
          : FILTERS[filter]();
        const list = res.data
          .map(b => ({ ...b, dt: dayjs(b.booking_time) }))
          .filter(b => {
            const t = b.dt.valueOf();
            return t >= from.valueOf() && t <= to.valueOf();
          })
          .sort((a,b)=>a.dt.valueOf()-b.dt.valueOf());
        setBookings(list);
      })
      .catch(console.error);
  }, [filter, customDate]);

  const headerLabel = () => {
    if (filter==='today')    return 'сегодня';
    if (filter==='tomorrow') return 'завтра';
    if (filter==='week')     return 'на следующую неделю';
    return `на ${dayjs(customDate).format('DD-MM-YYYY')}`;
  };

  const toggleForm = () => {
    setEditing(null);
    setShowForm(v => !v);
    setExpandedId(null);
  };

  const startEdit = booking => {
    setEditing(booking);
    setShowForm(true);
    setExpandedId(null);
  };

  const handleCreated = () => {
    setShowForm(false);
    setEditing(null);
    setExpandedId(null);
  };

  const handleUpdated = updated => {
    const u = { ...updated, dt: dayjs(updated.booking_time) };
    setShowForm(false);
    setEditing(null);
    setExpandedId(null);
    setBookings(bs => bs.map(b => b.id===u.id ? u : b));
  };

  const handleDelete = async id => {
    if (!window.confirm('Удалить эту бронь?')) return;
    await api.delete(`/bookings/${id}`);
    setBookings(bs => bs.filter(b => b.id !== id));
    setExpandedId(null);
  };

  return (
    <div style={{ padding:20 }}>
      <h2>Бронирования {headerLabel()}</h2>

      {/* Кнопка между заголовком и фильтрами */}
      <button className="btn" onClick={toggleForm} style={{ marginBottom:12 }}>
        {showForm ? 'Отменить' : 'Добавить бронь'}
      </button>

      {showForm && !editing &&
        <BookingForm onCreated={handleCreated} />
      }
      {showForm && editing &&
        <BookingForm editableBooking={editing} onUpdate={handleUpdated} />
      }

      {/* Фильтры */}
      <div className="filters">
        {['today','tomorrow','week','custom'].map(key => {
          let label = key==='today' ? 'Сегодня'
                    : key==='tomorrow' ? 'Завтра'
                    : key==='week' ? 'На неделю'
                    : '';
          return key!=='custom' ? (
            <button
              key={key}
              className={`btn${filter===key?' active':''}`}
              onClick={() => { setFilter(key); setShowForm(false); setExpandedId(null); }}
            >
              {label}
            </button>
          ) : (
            <React.Fragment key="custom">
              <input
                type="date"
                value={customDate}
                onChange={e=>setCustomDate(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&setFilter('custom')}
              />
              <button
                className={`btn${filter==='custom'?' active':''}`}
                onClick={()=>{setFilter('custom'); setShowForm(false); setExpandedId(null);}}
              >
                По дате 🔍
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Таблица */}
      <table className="table">
        <thead>
          <tr>
            <th>Время</th><th>Гость</th><th>Телефон</th>
            <th>Кол-во гостей</th><th>Стол №</th>
            <th>Инстр.</th><th>Комментарий</th><th>Создал</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <React.Fragment key={b.id}>
              <tr onClick={() => setExpandedId(expandedId===b.id ? null : b.id)}>
                <td>
                  {filter==='week'
                    ? b.dt.format('DD-MM HH:mm')
                    : b.dt.format('HH:mm')}
                </td>
                <td>{`${b.first_name} ${b.last_name}`}</td>
                <td>{b.phone}</td>
                <td style={{textAlign:'right'}}>{b.number_of_guests}</td>
                <td style={{textAlign:'right'}}>{b.table_number}</td>
                <td style={{textAlign:'center'}}>{b.instructions_acknowledged?'Да':'Нет'}</td>
                <td>{b.extra_info||'—'}</td>
                <td>{b.created_by.full_name}</td>
              </tr>
              {expandedId===b.id && (
                <tr className="action-row">
                  <td colSpan={8}>
                    <button className="btn" onClick={() => startEdit(b)}>
                      Редактировать
                    </button>
                    <button className="btn" onClick={() => handleDelete(b.id)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}