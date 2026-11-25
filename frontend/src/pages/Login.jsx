import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { erroMsg } from '../services/api';
import Alerta from '../components/Alerta';

export default function Login() {
  const { login } = useAuth();
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
      navigate('/colecao');
    } catch (err) {
      setErro(erroMsg(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container tela-auth">
      <div className="card shadow">
        <div className="card-body p-4">
          <h1 className="h2 text-info text-center mb-1">AniVerse</h1>
          <p className="text-secondary text-center mb-4">Entre para acessar sua coleção</p>

          <Alerta>{erro}</Alerta>

          <form onSubmit={enviar}>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={mudar} required autoFocus />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="senha">Senha</label>
              <input id="senha" name="senha" type="password" className="form-control" value={form.senha} onChange={mudar} required />
            </div>
            <button type="submit" className="btn btn-info w-100" disabled={enviando}>
              {enviando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
