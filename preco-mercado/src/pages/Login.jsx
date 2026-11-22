import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Mensagem from '../components/Mensagem';

function traduzirErro(erro) {
  const msg = erro?.message ?? '';
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (msg.includes('already registered')) return 'Este e-mail já tem cadastro.';
  if (msg.includes('Password should be')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (msg.toLowerCase().includes('signups not allowed')) return 'Novos cadastros estão desativados.';
  return msg || 'Não foi possível concluir. Tente de novo.';
}

export default function Login() {
  const { usuario, carregando, entrar, cadastrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const [modo, setModo] = useState('entrar'); // 'entrar' | 'criar'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);

  if (!carregando && usuario) return <Navigate to={local.state?.de ?? '/'} replace />;

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro(null);
    setAviso(null);
    setEnviando(true);
    try {
      if (modo === 'entrar') {
        await entrar(email.trim(), senha);
        navegar(local.state?.de ?? '/', { replace: true });
      } else {
        const sessao = await cadastrar(email.trim(), senha);
        if (sessao) navegar('/', { replace: true });
        else setAviso('Conta criada. Confirme o e-mail que enviamos e depois entre.');
      }
    } catch (e) {
      setErro(traduzirErro(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login">
      <header className="login__topo">
        <span className="login__marca">preço / mercado</span>
        <h1>Cada iene<br />sob controle.</h1>
        <p>Registre o preço de cada mercado e compare na hora.</p>
      </header>

      <form onSubmit={handleSubmit} className="formulario">
        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" required minLength={6}
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>

        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        {aviso && <Mensagem>{aviso}</Mensagem>}

        <button type="submit" className="botao botao--primario" disabled={enviando}>
          {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
        </button>
        <button type="button" className="botao botao--texto"
          onClick={() => { setModo(modo === 'entrar' ? 'criar' : 'entrar'); setErro(null); setAviso(null); }}>
          {modo === 'entrar' ? 'Criar conta' : 'Já tenho conta'}
        </button>
      </form>
    </main>
  );
}
