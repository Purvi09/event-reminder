import React, { useState } from 'react';
import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ErrorResponse } from '../types';
import { config } from '../config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';

const EventForm: React.FC = () => {
  const [eventName, setEventName] = useState<string>('');
  const [eventDescription, setEventDescription] = useState<string>('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get the user's local timezone (e.g., "Asia/Kolkata")
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatDateToUTC = (date: Date | null): string => {
    if (!date) return '';
    // Convert local date to UTC, ensuring the time reflects the user's input in their timezone
    const utcDate = toZonedTime(date, userTimeZone);
    return formatInTimeZone(utcDate, 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");
  };

  const formatDateToLocalISO = (date: Date | null): string => {
    if (!date) return '';
    // Format date in the user's local timezone with offset (e.g., "2025-06-12T17:00:00+05:30")
    return formatInTimeZone(date, userTimeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventDate || !reminderDate) {
      toast.error('Please select both event time and reminder time');
      return;
    }
    
    if (reminderDate > eventDate) {
      toast.error('Reminder time cannot be after event time');
      return;
    }
    
    setIsLoading(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error('No ID token found');
      
      const eventData = {
        event_name: eventName,
        event_description: eventDescription,
        event_time: formatDateToUTC(eventDate), // UTC for EventBridge
        reminder_time: formatDateToUTC(reminderDate), // UTC for EventBridge
        event_time_local: formatDateToLocalISO(eventDate), // Local for DynamoDB
        reminder_time_local: formatDateToLocalISO(reminderDate), // Local for DynamoDB
      };
      
      console.log('Submitting event data:', eventData);
      console.log('To API endpoint:', `${config.apiUrl}/events`);
      
      await axios.post(
        `${config.apiUrl}/events`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success('Event created successfully!');
      setEventName('');
      setEventDescription('');
      setEventDate(null);
      setReminderDate(null);
      
      // Trigger a refresh of the event list
      const refreshEvent = new CustomEvent('refreshEvents');
      window.dispatchEvent(refreshEvent);
    } catch (err: any) {
      toast.error((err.response?.data as ErrorResponse)?.error || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Create Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Event Name</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Description</label>
          <textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Event Time</label>
          <DatePicker
            selected={eventDate}
            onChange={(date) => setEventDate(date)}
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholderText="Select event date and time"
            timeZone={userTimeZone} // Ensure DatePicker uses local timezone
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Reminder Time</label>
          <DatePicker
            selected={reminderDate}
            onChange={(date) => setReminderDate(date)}
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholderText="Select reminder date and time"
            maxDate={eventDate || undefined}
            timeZone={userTimeZone} // Ensure DatePicker uses local timezone
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-700 transition font-semibold disabled:bg-blue-300"
        >
          {isLoading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EventForm;