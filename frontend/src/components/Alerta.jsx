export default function Alerta({ tipo = 'danger', children }) {
  if (!children) return null;
  return (
    <div className={`alert${tipo === 'success' ? ' alert-success' : ''}`} role={tipo === 'success' ? 'status' : 'alert'}>
      {children}
    </div>
  );
}
