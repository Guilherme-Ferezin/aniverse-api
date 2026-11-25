import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { erroMsg } from '../services/api';
import Alerta from '../components/Alerta';

export default function Register() {
  const { registrar, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    if (form.senha !== form.confirmar) {
      setErro('As senhas não conferem');
      return;
    }
    setEnviando(true);
    try {
      await registrar({ nome: form.nome, email: form.email, senha: form.senha });
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
          <h1 className="h2 text-info text-center mb-1">Criar conta</h1>
          <p className="text-secondary text-center mb-4">Monte sua coleção de animes</p>

          <Alerta>{erro}</Alerta>

          <form onSubmit={enviar}>
            <div className="mb-3">
              <label className="form-label" htmlFor="nome">Nome</label>
              <input id="nome" name="nome" className="form-control" value={form.nome} onChange={mudar} required autoFocus />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={mudar} required />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="senha">Senha</label>
              <input id="senha" name="senha" type="password" minLength={6} className="form-control" value={form.senha} onChange={mudar} required />
              <div className="form-text">Mínimo de 6 caracteres.</div>
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="confirmar">Confirmar senha</label>
              <input id="confirmar" name="confirmar" type="password" className="form-control" value={form.confirmar} onChange={mudar} required />
            </div>
            <button type="submit" className="btn btn-info w-100" disabled={enviando}>
              {enviando ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
