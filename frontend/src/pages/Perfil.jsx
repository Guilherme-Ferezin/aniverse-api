import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { erroMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';

export default function Perfil() {
  const { atualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    api
      .get('/perfil')
      .then((r) => setForm({ nome: r.data.nome, email: r.data.email, senha: '' }))
      .catch((e) => setErro(erroMsg(e)))
      .finally(() => setCarregando(false));
  }, []);

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    setAviso('');
    setSalvando(true);
    try {
      const corpo = { nome: form.nome, email: form.email };
      if (form.senha) corpo.senha = form.senha;
      const { data } = await api.put('/perfil', corpo);
      atualizarUsuario({ id: data.id, nome: data.nome, email: data.email });
      setForm({ nome: data.nome, email: data.email, senha: '' });
      setAviso('Perfil atualizado com sucesso!');
    } catch (err) {
      setErro(erroMsg(err));
    } finally {
      setSalvando(false);
    }
  }

  async function excluirConta() {
    if (!window.confirm('Excluir sua conta? Sua coleção também será apagada. Isso não pode ser desfeito.')) return;
    try {
      await api.delete('/perfil');
      logout();
      navigate('/login');
    } catch (err) {
      setErro(erroMsg(err));
    }
  }

  if (carregando) return <Carregando />;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <h1 className="h3 mb-3">Meu perfil</h1>
        <Alerta>{erro}</Alerta>
        <Alerta tipo="success">{aviso}</Alerta>

        <form onSubmit={salvar} className="card card-body mb-4">
          <div className="mb-3">
            <label className="form-label" htmlFor="nome">Nome</label>
            <input id="nome" name="nome" className="form-control" value={form.nome} onChange={mudar} required />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={mudar} required />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="senha">Nova senha</label>
            <input id="senha" name="senha" type="password" minLength={6} className="form-control" value={form.senha} onChange={mudar} />
            <div className="form-text">Deixe em branco para manter a senha atual.</div>
          </div>
          <button type="submit" className="btn btn-info" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>

        <div className="card border-danger">
          <div className="card-body">
            <h2 className="h6 text-danger">Zona de perigo</h2>
            <p className="small text-secondary">Excluir a conta apaga também toda a sua coleção.</p>
            <button className="btn btn-outline-danger btn-sm" onClick={excluirConta}>Excluir minha conta</button>
          </div>
        </div>
      </div>
    </div>
  );
}
