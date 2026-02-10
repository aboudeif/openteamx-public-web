# Chat Feature

The Chat feature facilitates real-time communication within teams, supporting channels and direct messages.

## 📁 Structure

- **`pages/ChatPage.tsx`**: Main entry point. Handles the layout, sidebar (channels/users), and message stream.
- **`components/`**: 
  - `ChatWidget.tsx`: Dashboard summary widget.
  - Modals for creating workspaces, attaching files, etc.

## 🚀 Key Capabilities
- **Workspace Channels**: Create and manage text channels.
- **Direct Messaging**: Chat with team members.
- **Message Features**: Emojis, reactions, mentions, and editing.
- **Attachments**: Link to Drive files or external URLs.

## 🔌 Data Sources
- **Component State**: Messages and new channels are stored in local React state (`useState`). They reset on reload.
- **Static Data**: Initial message history and user lists are hardcoded within `ChatPage.tsx`.

## 🔮 Expected Backend Interaction
- **WebSocket**: Real-time message delivery and presence updates.
- **REST/GraphQL**: Fetching channel history, user lists, and workspace configuration.
- **Persistence**: Storing messages and attachments.
