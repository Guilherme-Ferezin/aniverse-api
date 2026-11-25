export default function Alerta({ tipo = 'danger', children }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${tipo}`} role="alert">
      {children}
    </div>
  );
}
