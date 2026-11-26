import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { erroMsg } from '../services/api';
import { useToast } from '../context/ToastContext';
import Alerta from '../components/Alerta';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const { login } = useAuth();
  const avisar = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await login(form.email, form.senha);
      avisar('Login realizado. Bem-vindo de volta!');
      navigate('/colecao');
    } catch (err) {
      setErro(erroMsg(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Entrar" subtitulo="Acesse sua coleção de animes.">
      <Alerta>{erro}</Alerta>

      <form onSubmit={enviar}>
        <label className="field">
          <span>E-mail</span>
          <input name="email" type="email" value={form.email} onChange={mudar} required autoFocus />
        </label>
        <label className="field">
          <span>Senha</span>
          <input name="senha" type="password" value={form.senha} onChange={mudar} required />
        </label>
        <button type="submit" className="btn btn-primary full-btn" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="auth-alt">
        Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
      </p>
    </AuthLayout>
  );
}
