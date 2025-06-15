import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import DatePicker from 'react-datepicker';
import BookingForm from './BookingForm';
import './BookingList.css';
import 'react-datepicker/dist/react-datepicker.css';

// Добавляем плагины для работы с UTC и временными зонами
dayjs.extend(utc);
dayjs.extend(timezone);

export default function BookingList() {
  const PAGE_SIZE = 20;

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('today');
  const [customDate, setCustomDate] = useState(new Date());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: 'booking_time',
    direction: 'asc'
  });

  const FILTERS = {
    today: () => ({ 
      from: dayjs().startOf('day'), 
      to: dayjs().endOf('day') 
    }),
    tomorrow: () => {
      const m = dayjs().add(1, 'day');
      return { from: m.startOf('day'), to: m.endOf('day') };
    },
    week: () => ({ 
      from: dayjs().startOf('week'), 
      to: dayjs().endOf('week') 
    }),
    custom: d => ({ 
      from: dayjs(d).startOf('day'), 
      to: dayjs(d).endOf('day') 
    }),
    all: () => null,
  };

  const loadBookings = useCallback(() => {
    const params = {
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
    };

    // Формируем параметры дат только для не-"all" фильтров
    if (filter !== 'all') {
      const { from, to } = FILTERS[filter](customDate);
      
      // Исправленный формат дат - без миллисекунд и с указанием временной зоны
      params.from_dt = from.format('YYYY-MM-DDTHH:mm:ssZ');
      params.to_dt = to.format('YYYY-MM-DDTHH:mm:ssZ');
    }

    console.log("Request params:", params); // Для отладки

    api.get('/service/bookings/', {
      params
    })
    .then(res => {
      const total = parseInt(res.headers['x-total-count'], 10) || 0;
      setTotalCount(total);
      setHasMore((page + 1) * PAGE_SIZE < total);

      const data = res.data.map(b => ({
        ...b,
        dt: dayjs(b.booking_time),
        booking_time: new Date(b.booking_time),
      }));

      // Сортируем данные
      const sorted = sortBookings(data);
      setBookings(sorted);
    })
    .catch(err => {
      console.error('Ошибка загрузки бронирований:', err);
      if (err.response) {
        console.error('Детали ошибки:', err.response.data);
      }
    });
  }, [filter, customDate, page, sortConfig]);

  useEffect(() => { 
    setPage(0); 
  }, [filter, customDate]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const sortBookings = (data) => {
    return [...data].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      
      if (valA === undefined || valB === undefined) return 0;
      
      // Для дат используем timestamp
      if (sortConfig.key === 'booking_time') {
        return sortConfig.direction === 'asc' 
          ? a.dt - b.dt 
          : b.dt - a.dt;
      }
      
      // Для остальных типов данных
      return sortConfig.direction === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  };

  const handleSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const headerLabel = () => {
    if (filter === 'today') return 'сегодня';
    if (filter === 'tomorrow') return 'завтра';
    if (filter === 'week') return 'на эту неделю';
    if (filter === 'custom') return `на ${dayjs(customDate).format('DD-MM-YYYY')}`;
    return '';
  };

  const onFilterClick = key => {
    setFilter(key);
    setShowForm(false);
    setPage(0);
    setExpandedId(null);
    setConfirmDeleteId(null);
  };

  const formatPhone = phone => {
    if (!phone) return '';
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 $2 $3-$4-$5');
  };

  const handleArrivedChange = async (b, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/bookings/${b.id}`, { arrived: !b.arrived });
      loadBookings();
    } catch (err) {
      console.error('Ошибка при обновлении посещения:', err);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleRowClick = (id, e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
    setConfirmDeleteId(null);
    setExpandedId(expandedId === id ? null : id);
  };

  const confirmDelete = async id => {
    try {
      await api.delete(`/bookings/${id}`);
      setConfirmDeleteId(null);
      setExpandedId(null);
      loadBookings();
    } catch (err) {
      console.error('Ошибка при удалении брони:', err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Бронирования {headerLabel()}</h2>

      <button
        className="btn"
        onClick={() => {
          setShowForm(true);
          setEditing(null);
          setExpandedId(null);
          setConfirmDeleteId(null);
        }}
        style={{ marginBottom: 12 }}
      >
        {showForm ? 'Отменить' : 'Добавить бронь'}
      </button>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <BookingForm
              onCreated={() => { loadBookings(); closeForm(); }}
              onUpdate={() => { loadBookings(); closeForm(); }}
              editableBooking={editing}
              onClose={closeForm}
            />
          </div>
        </div>
      )}

      <div className="filters">
        {['today','tomorrow','week','custom','all'].map(key => {
          const labels = { today: 'Сегодня', tomorrow: 'Завтра', week: 'На неделю', custom: 'Выбрать дату', all: 'Все' };
          return (
            <div key={key} className="filter-item">
              {key !== 'custom' ? (
                <button
                  className={`btn${filter === key ? ' active' : ''}`}
                  onClick={() => onFilterClick(key)}
                >
                  {labels[key]}
                </button>
              ) : (
                <DatePicker
                  selected={customDate}
                  onChange={date => { setCustomDate(date); onFilterClick('custom'); }}
                  customInput={
                    <button className={`btn${filter === 'custom' ? ' active' : ''}`}>
                      Выбрать дату
                    </button>
                  }
                  dateFormat="dd-MM-yyyy"
                />
              )}
            </div>
          );
        })}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th onClick={() => handleSort('booking_time')}>
              Время {sortConfig.key === 'booking_time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
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
              <tr
                className={`${b.arrived ? 'arrived' : ''} ${expandedId === b.id ? 'expanded' : ''}`}
                onClick={e => handleRowClick(b.id, e)}
              >
                <td>
                  {filter === 'all'
                    ? b.dt.format('HH:mm DD.MM.YYYY')
                    : filter === 'week'
                      ? b.dt.format('HH:mm DD-MM')
                      : b.dt.format('HH:mm')}
                </td>
                <td>{`${b.first_name} ${b.last_name}`}</td>
                <td>{formatPhone(b.phone)}</td>
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
                    onChange={e => handleArrivedChange(b, e)}
                  />
                </td>
              </tr>

              {expandedId === b.id && (
                <tr className="action-row">
                  <td colSpan={9}>
                    {!confirmDeleteId && (
                      <div className="action-buttons">
                        <button
                          className="btn"
                          onClick={e => {
                            e.stopPropagation();
                            setEditing(b);
                            setShowForm(true);
                          }}
                        >
                          Редактировать
                        </button>
                        <button
                          className="btn danger"
                          onClick={e => {
                            e.stopPropagation();
                            setConfirmDeleteId(b.id);
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                    {confirmDeleteId === b.id && (
                      <div className="action-buttons">
                        <button
                          className="btn"
                          onClick={e => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                        >
                          Отмена
                        </button>
                        <button
                          className="btn danger"
                          onClick={e => {
                            e.stopPropagation();
                            confirmDelete(b.id);
                          }}
                        >
                          Подтвердить
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div className="pagination-container">
        <div className="pagination-info">
          Страница: {page + 1} из {Math.max(Math.ceil(totalCount / PAGE_SIZE), 1)} | Всего записей: {totalCount}
        </div>
        <div className="pagination-controls">
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
            disabled={(page + 1) * PAGE_SIZE >= totalCount}
          >
            Вперед →
          </button>
        </div>
      </div>
    </div>
  );
}
