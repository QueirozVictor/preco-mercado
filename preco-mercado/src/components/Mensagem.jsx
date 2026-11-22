export default function Mensagem({ tipo = 'info', children }) {
  return (
    <p className={`mensagem mensagem--${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
