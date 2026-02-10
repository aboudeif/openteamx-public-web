# Drive Feature

The Drive feature provides file management and document editing capabilities.

## 📁 Structure

- **`pages/DrivePage.tsx`**: Main file explorer view (grid/list).
- **`pages/TextEditorPage.tsx`**: WYSIWYG editor for text documents.
- **`pages/SpreadsheetEditorPage.tsx`**: Spreadsheet interface for data files.
- **`components/`**: 
  - `DriveWidget.tsx`: Dashboard summary widget.
  - Modals for file access and external links.

## 🚀 Key Capabilities
- **File Management**: View, sort, and filter files.
- **Editors**: Integrated editors for documents and spreadsheets.
- **Organization**: Folders and file categorization.

## 🔌 Data Sources
- **Static Data**: File lists are hardcoded arrays in `DrivePage.tsx`.
- **State**: Editor content is local to the session.

## 🔮 Expected Backend Interaction
- **File Storage**: Upload/Download API (S3/Blob Storage).
- **Metadata**: Database for file hierarchy, permissions, and timestamps.
- **Real-time Collaboration**: WebSocket connection for simultaneous editing in `TextEditorPage` and `SpreadsheetEditorPage`.
