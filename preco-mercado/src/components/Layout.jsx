import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Layout() {
  const { usuario, sair } = useAuth();
  const navegar = useNavigate();

  async function handleSair() {
    await sair();
    navegar('/login', { replace: true });
  }

  return (
    <div className="layout">
      <header className="cabecalho">
        <NavLink to="/" className="cabecalho__marca">Preço Mercado</NavLink>
        <nav className="cabecalho__nav" aria-label="Principal">
          <NavLink to="/" end>Catálogo</NavLink>
          <NavLink to="/registrar">Registrar preço</NavLink>
          <button type="button" className="botao botao--texto" onClick={handleSair} title={usuario?.email}>
            Sair
          </button>
        </nav>
      </header>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
