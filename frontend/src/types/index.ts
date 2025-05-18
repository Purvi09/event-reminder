export interface Event {
    event_id: string;
    event_name: string;
    event_description: string;
    event_time: string;
    reminder_time: string;
  }
  export interface EventResponse {
    events: Event[];
  }
  export interface ErrorResponse {
    error: string;
  }