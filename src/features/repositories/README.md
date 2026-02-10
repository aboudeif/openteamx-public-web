# Repositories Feature

The Repositories feature provides a code collaboration interface similar to GitHub/GitLab.

## 📁 Structure

- **`pages/RepositoriesPage.tsx`**: List of team repositories.
- **`pages/RepositoryPage.tsx`**: Detailed view including file tree, README rendering, and branch switching simulation.
- **`components/`**: Modals for creating repositories.

## 🚀 Key Capabilities
- **Code Navigation**: Browse file structures.
- **Management**: Create and configure repositories.
- **Stats**: View language usage and activity.

## 🔌 Data Sources
- **Static Data**: Mock repositories and a simulated file tree structure are defined locally.

## 🔮 Expected Backend Interaction
- **Git Host Integration**: Connect to GitHub/GitLab APIs.
- **File Content**: Fetch raw file content for viewing.
- **CI/CD**: Display build statuses and deployment info.
