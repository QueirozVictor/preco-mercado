import { createContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    authService
      .obterSessao()
      .then((s) => ativo && setSessao(s))
      .catch(() => ativo && setSessao(null))
      .finally(() => ativo && setCarregando(false));

    const inscricao = authService.aoMudarSessao((s) => setSessao(s));
    return () => {
      ativo = false;
      inscricao.unsubscribe();
    };
  }, []);

  const valor = useMemo(
    () => ({
      sessao,
      usuario: sessao?.user ?? null,
      carregando,
      entrar: authService.entrar,
      cadastrar: authService.cadastrar,
      sair: authService.sair,
    }),
    [sessao, carregando],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
