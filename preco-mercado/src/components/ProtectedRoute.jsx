import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Mensagem from './Mensagem';

export default function ProtectedRoute() {
  const { usuario, carregando } = useAuth();
  const local = useLocation();

  if (carregando) return <Mensagem>Carregando…</Mensagem>;
  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  return <Outlet />;
}
