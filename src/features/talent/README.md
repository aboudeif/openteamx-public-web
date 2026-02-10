# Talent Workspace Feature

The Talent Workspace is the personal dashboard for the logged-in user, focusing on their career, earnings, and memberships.

## 📁 Structure

- **`pages/DashboardPage.tsx`**: Personal overview (Stats, Wallet, CV).
- **`pages/MyTeamsPage.tsx`**: List of joined teams.
- **`pages/WalletPage.tsx`**: Token and earnings details.
- **`pages/NotificationsPage.tsx`**: User alerts.
- **`components/`**: Specialized widgets like `WalletWidget`, `CVWidget`, `ActivityAnalyticsWidget`.

## 🚀 Key Capabilities
- **Profile Management**: View and edit CV/Resume.
- **Financials**: Track earnings and rewards.
- **Analytics**: Personal contribution graphs.

## 🔌 Data Sources
- **Widget Data**: Each widget component currently contains its own mock data (e.g., chart data, transaction history).
- **User Context**: Assumes a hardcoded user ("John Doe").

## 🔮 Expected Backend Interaction
- **Auth Service**: User session management and profile fetching.
- **Analytics API**: Aggregated data for user activity across teams.
- **Blockchain/Ledger**: For Wallet and Rewards implementation.
