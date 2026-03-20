// src/pages/admin/LoginPage.jsx
// Réutilise la même logique que AgentLoginPage

import AgentLoginPage from '../agent/LoginPage'

// La page admin pointe vers le même composant (même endpoint /api/auth/login)
// La redirection se fait automatiquement selon le rôle retourné
export default AgentLoginPage
