import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Event, EventResponse, ErrorResponse } from '../types';
import { config } from '../config';
import { format, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import { toast, ToastContainer } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import LoadingSpinner from './LoadingSpinner';

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [editEventDate, setEditEventDate] = useState<Date | null>(null);
  const [editReminderDate, setEditReminderDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    
    window.addEventListener('refreshEvents', fetchEvents);
    
    // Add an online event listener to retry fetching when connection is restored
    window.addEventListener('online', () => {
      if (error) fetchEvents();
    });
    
    return () => {
      window.removeEventListener('refreshEvents', fetchEvents);
      window.removeEventListener('online', () => {
        if (error) fetchEvents();
      });
    };
  }, [error]);

  const formatDateToISO = (date: Date | null): string => {
    if (!date) return '';
    return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'");
  };

  const formatISOToDate = (isoString: string): Date => {
    return parseISO(isoString);
  };

  const formatDateDisplay = (isoString: string): string => {
    try {
      return format(parseISO(isoString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return isoString;
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error('No ID token found');
      
      const response = await axios.get<EventResponse>(`${config.apiUrl}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setEvents(response.data.events);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      const errorMessage = (err.response?.data as ErrorResponse)?.error || 'Failed to fetch events';
      toast.error(errorMessage);
      setError(errorMessage);
      // Set events to empty array to ensure UI still shows something
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    setDeletingEventId(eventId);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error('No ID token found');
      
      await axios.delete(`${config.apiUrl}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Event deleted successfully!');
      fetchEvents();
    } catch (err: any) {
      console.error('Error deleting event:', err);
      const errorMessage = (err.response?.data as ErrorResponse)?.error || 'Failed to delete event';
      toast.error(errorMessage);
      // Don't set global error state here as we want to keep showing the list
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleEditClick = (event: Event) => {
    setEditEvent(event);
    setEditEventDate(formatISOToDate(event.event_time));
    setEditReminderDate(formatISOToDate(event.reminder_time));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEvent || !editEventDate || !editReminderDate) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (editReminderDate > editEventDate) {
      toast.error('Reminder time cannot be after event time');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error('No ID token found');
      
      await axios.put(
        `${config.apiUrl}/events/${editEvent.event_id}`,
        {
          event_name: editEvent.event_name,
          event_description: editEvent.event_description,
          event_time: formatDateToISO(editEventDate),
          reminder_time: formatDateToISO(editReminderDate),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success('Event updated successfully!');
      setEditEvent(null);
      fetchEvents();
    } catch (err: any) {
      console.error('Error updating event:', err);
      const errorMessage = (err.response?.data as ErrorResponse)?.error || 'Failed to update event';
      toast.error(errorMessage);
      // Don't set global error state here as we want to keep editing UI open
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Events</h2>
        <LoadingSpinner message="Loading events..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Events</h2>
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h3 className="text-red-700 font-semibold text-lg mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchEvents}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Events</h2>
      {events && events.length === 0 ? (
        <p className="text-gray-600 text-center p-4">No events found. Create your first event above!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">Name</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">Description</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">Event Time</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">Reminder Time</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events && events.length > 0 && events.map((event) => (
                <tr key={event.event_id} className="hover:bg-gray-50 transition">
                  {editEvent && editEvent.event_id === event.event_id ? (
                    <td colSpan={5} className="border border-gray-300 p-4">
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                          <label className="block text-gray-600 font-medium mb-1">Event Name</label>
                          <input
                            type="text"
                            value={editEvent.event_name}
                            onChange={(e) => setEditEvent({ ...editEvent, event_name: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-medium mb-1">Description</label>
                          <textarea
                            value={editEvent.event_description}
                            onChange={(e) => setEditEvent({ ...editEvent, event_description: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-medium mb-1">Event Time</label>
                          <DatePicker
                            selected={editEventDate}
                            onChange={(date) => setEditEventDate(date)}
                            showTimeSelect
                            dateFormat="yyyy-MM-dd HH:mm"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600 font-medium mb-1">Reminder Time</label>
                          <DatePicker
                            selected={editReminderDate}
                            onChange={(date) => setEditReminderDate(date)}
                            showTimeSelect
                            dateFormat="yyyy-MM-dd HH:mm"
                            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            maxDate={editEventDate || undefined}
                            required
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition font-semibold disabled:bg-green-400"
                          >
                            {isSubmitting ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditEvent(null)}
                            className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700 transition font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="border border-gray-300 p-3">{event.event_name}</td>
                      <td className="border border-gray-300 p-3">{event.event_description}</td>
                      <td className="border border-gray-300 p-3">{formatDateDisplay(event.event_time)}</td>
                      <td className="border border-gray-300 p-3">{formatDateDisplay(event.reminder_time)}</td>
                      <td className="border border-gray-300 p-3">
                        <button
                          onClick={() => handleEditClick(event)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.event_id)}
                          disabled={deletingEventId === event.event_id}
                          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition disabled:bg-red-400"
                        >
                          {deletingEventId === event.event_id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EventList;
