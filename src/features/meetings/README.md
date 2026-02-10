# Meetings Feature

The Meetings feature handles team scheduling, calendars, and meeting documentation.

## 📁 Structure

- **`pages/MeetingsPage.tsx`**: List view of upcoming and past meetings.
- **`pages/CalendarPage.tsx`**: Monthly/Weekly calendar view.
- **`pages/MeetingNotesPage.tsx`**: Library of meeting minutes and transcripts.
- **`pages/MeetingNoteDetailsPage.tsx`**: Editor/Viewer for specific meeting notes.
- **`components/`**: Widgets for dashboard integration.

## 🚀 Key Capabilities
- **Scheduling**: Visual calendar for events.
- **Documentation**: Rich text notes linked to meetings.
- **Integration**: Links to video calls (Zoom/Meet).

## 🔌 Data Sources
- **Static Data**: Meeting events and note content are hardcoded arrays.

## 🔮 Expected Backend Interaction
- **Calendar API**: Sync with Google/Outlook Calendars.
- **Database**: Store meeting metadata, attendees, and rich-text notes.
- **Real-time**: Sync changes to notes during meetings.
