import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { supabaseConfigurado } from './lib/supabase';
import Layout from './components/Layout';
import Mensagem from './components/Mensagem';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import ProdutoDetalhe from './pages/ProdutoDetalhe';
import RegistrarPreco from './pages/RegistrarPreco';

export default function App() {
  if (!supabaseConfigurado) {
    return (
      <main className="login">
        <h1>Configuração pendente</h1>
        <Mensagem tipo="erro">
          Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env (veja .env.example) e reinicie o servidor.
        </Mensagem>
      </main>
    );
  }

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Catalogo />} />
              <Route path="produto/:id" element={<ProdutoDetalhe />} />
              <Route path="registrar" element={<RegistrarPreco />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
