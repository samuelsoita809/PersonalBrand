import DashboardPage from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import './index.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated ? <DashboardPage /> : <LoginPage />}
    </div>
  );
}

export default App;
