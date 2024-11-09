import { Route, Routes } from 'react-router-dom';
import Login from './components/login.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import UserPage from './components/UserPage.tsx';

function App() {
  return (
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/dashboard' element={<AdminDashboard />}/>
        <Route path='/user' element={<UserPage />}/>
      </Routes>
  );
}

export default App;
