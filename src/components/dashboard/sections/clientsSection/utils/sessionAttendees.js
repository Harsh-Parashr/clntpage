
// Mock data: 5 session attendees with sessions 1 to 5
// Timestamps are ISO strings for simplicity; replace with Firestore Timestamp if needed
const sessionAttendees = [
  // Attendee with only 1 session
  {
    sessionId: "session_1",
    attendeeId: "attendee_1",
    attendeeName: "Alice Johnson",
    attendeeEmail: "alice.johnson@email.com",
    attendeePhone: "+1-555-0001",
    attendeeDateOfBirth: new Date("1990-04-12")
  },

  // Attendee with multiple sessions
  {
    sessionId: "session_2",
    attendeeId: "attendee_2",
    attendeeName: "Bob Smith",
    attendeeEmail: "bob.smith@email.com",
    attendeePhone: "+1-555-0002",
    attendeeDateOfBirth: new Date("1985-08-23")
  },
  {
    sessionId: "session_3",
    attendeeId: "attendee_2",
    attendeeName: "Bob Smith",
    attendeeEmail: "bob.smith@email.com",
    attendeePhone: "+1-555-0002",
    attendeeDateOfBirth: new Date("1985-08-23")
  },
  {
    sessionId: "session_5",
    attendeeId: "attendee_2",
    attendeeName: "Bob Smith",
    attendeeEmail: "bob.smith@email.com",
    attendeePhone: "+1-555-0002",
    attendeeDateOfBirth: new Date("1985-08-23")
  },

  // Another attendee with multiple sessions
  {
    sessionId: "session_1",
    attendeeId: "attendee_3",
    attendeeName: "Charlie Davis",
    attendeeEmail: "charlie.davis@email.com",
    attendeePhone: "+1-555-0003",
    attendeeDateOfBirth: new Date("1992-12-05")
  },
  {
    sessionId: "session_4",
    attendeeId: "attendee_3",
    attendeeName: "Charlie Davis",
    attendeeEmail: "charlie.davis@email.com",
    attendeePhone: "+1-555-0003",
    attendeeDateOfBirth: new Date("1992-12-05")
  },

  // Another attendee
  {
    sessionId: "session_2",
    attendeeId: "attendee_4",
    attendeeName: "Dana Lee",
    attendeeEmail: "dana.lee@email.com",
    attendeePhone: "+1-555-0004",
    attendeeDateOfBirth: new Date("1988-06-15")
  },
  {
    sessionId: "session_3",
    attendeeId: "attendee_4",
    attendeeName: "Dana Lee",
    attendeeEmail: "dana.lee@email.com",
    attendeePhone: "+1-555-0004",
    attendeeDateOfBirth: new Date("1988-06-15")
  },
  {
    sessionId: "session_6",
    attendeeId: "attendee_4",
    attendeeName: "Dana Lee",
    attendeeEmail: "dana.lee@email.com",
    attendeePhone: "+1-555-0004",
    attendeeDateOfBirth: new Date("1988-06-15")
  },

  // Last attendee
  {
    sessionId: "session_5",
    attendeeId: "attendee_5",
    attendeeName: "Ethan Miller",
    attendeeEmail: "ethan.miller@email.com",
    attendeePhone: "+1-555-0005",
    attendeeDateOfBirth: new Date("1995-11-30")
  }
];

export default sessionAttendees;