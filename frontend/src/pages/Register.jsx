import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { erroMsg } from '../services/api';
import { useToast } from '../context/ToastContext';
import Alerta from '../components/Alerta';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const { registrar, login } = useAuth();
  const avisar = useToast();
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
      avisar('Conta criada com sucesso! Bem-vindo ao AniVerse.');
      navigate('/colecao');
    } catch (err) {
      setErro(erroMsg(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Criar conta" subtitulo="Monte sua coleção de animes.">
      <Alerta>{erro}</Alerta>

      <form onSubmit={enviar}>
        <label className="field">
          <span>Nome</span>
          <input name="nome" value={form.nome} onChange={mudar} required autoFocus />
        </label>
        <label className="field">
          <span>E-mail</span>
          <input name="email" type="email" value={form.email} onChange={mudar} required />
        </label>
        <label className="field">
          <span>Senha</span>
          <input name="senha" type="password" minLength={6} value={form.senha} onChange={mudar} required />
          <small>Mínimo de 6 caracteres.</small>
        </label>
        <label className="field">
          <span>Confirmar senha</span>
          <input name="confirmar" type="password" value={form.confirmar} onChange={mudar} required />
        </label>
        <button type="submit" className="btn btn-primary full-btn" disabled={enviando}>
          {enviando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p className="auth-alt">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  );
}
