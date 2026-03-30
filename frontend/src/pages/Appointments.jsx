import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import api from '../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Appointments = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      const formattedEvents = res.data.map(appt => ({
        id: appt.id,
        title: `${appt.title} - ${appt.patient.first_name} ${appt.patient.last_name}`,
        start: new Date(appt.start_time),
        end: new Date(appt.end_time),
        resource: appt
      }));
      setEvents(formattedEvents);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: '#3b82f6',
      borderRadius: '8px',
      opacity: 0.85,
      color: 'white',
      border: 'none',
      display: 'block',
      padding: '4px 8px',
      fontSize: '0.85rem',
      fontWeight: '500',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    if (event.resource.status === 'completed') {
      style.backgroundColor = '#10b981';
    } else if (event.resource.status === 'cancelled') {
        style.backgroundColor = '#ef4444';
    }

    return { style };
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="text-primary-600" />
            <span>Clinic Schedule</span>
        </h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>New Appointment</span>
        </button>
      </div>

      <div className="card flex-1 p-6 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center text-slate-500">Loading calendar...</div>
        ) : (
          <div className="h-full min-h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              defaultView="week"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
