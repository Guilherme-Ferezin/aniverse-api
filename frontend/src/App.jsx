import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Colecao from './pages/Colecao';
import Animes from './pages/Animes';
import AnimeForm from './pages/AnimeForm';
import Generos from './pages/Generos';
import Perfil from './pages/Perfil';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/colecao" replace />} />
              <Route path="/colecao" element={<Colecao />} />
              <Route path="/animes" element={<Animes />} />
              <Route path="/animes/novo" element={<AnimeForm />} />
              <Route path="/animes/:id/editar" element={<AnimeForm />} />
              <Route path="/generos" element={<Generos />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
