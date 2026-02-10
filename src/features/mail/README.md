# Mail Feature

The Mail feature is an internal team communication tool for asynchronous messaging.

## 📁 Structure

- **`pages/MailPage.tsx`**: Dual-pane interface (Inbox list + Message detail).
- **`components/`**: 
  - `MailWidget.tsx`: Dashboard summary.

## 🚀 Key Capabilities
- **Inbox Management**: Read, archive, and delete emails.
- **Composition**: Rich text email editor.
- **Organization**: Labeling and categorization.

## 🔌 Data Sources
- **Static Data**: Pre-populated list of email objects (Sender, Subject, Body, Timestamp).
- **State**: Selection and "Read" status managed locally.

## 🔮 Expected Backend Interaction
- **SMTP/IMAP**: Integration for real email sending/receiving (or internal messaging system).
- **Search**: Server-side search for archived messages.
