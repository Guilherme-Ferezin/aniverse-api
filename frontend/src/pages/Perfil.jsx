import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { erroMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';
import Icone from '../components/Icone';

export default function Perfil() {
  const { atualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const avisar = useToast();
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

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
    setSalvando(true);
    try {
      const corpo = { nome: form.nome, email: form.email };
      if (form.senha) corpo.senha = form.senha;
      const { data } = await api.put('/perfil', corpo);
      atualizarUsuario({ id: data.id, nome: data.nome, email: data.email });
      setForm({ nome: data.nome, email: data.email, senha: '' });
      avisar('Perfil atualizado com sucesso!');
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
      avisar('Sua conta foi excluída.', 'info');
    } catch (err) {
      setErro(erroMsg(err));
    }
  }

  if (carregando) return <Carregando />;

  return (
    <div className="form-narrow">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Conta</span>
          <h2>Meu perfil</h2>
          <p>Mantenha seus dados de acesso atualizados.</p>
        </div>
      </div>
      <Alerta>{erro}</Alerta>

      <form onSubmit={salvar} className="panel form-panel">
        <div className="form-heading">
          <span className="stat-icon"><Icone nome="user" tamanho={17} /></span>
          <span><b>Dados pessoais</b><small>Nome, e-mail e senha de acesso</small></span>
        </div>

        <div className="form-grid">
          <label className="field col-3">
            <span>Nome</span>
            <input name="nome" value={form.nome} onChange={mudar} required />
          </label>
          <label className="field col-3">
            <span>E-mail</span>
            <input name="email" type="email" value={form.email} onChange={mudar} required />
          </label>
          <label className="field col-6">
            <span>Nova senha</span>
            <input name="senha" type="password" minLength={6} value={form.senha} onChange={mudar} />
            <small>Deixe em branco para manter a senha atual.</small>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>

      <section className="panel danger-zone">
        <h2>Zona de perigo</h2>
        <p>Excluir a conta apaga também toda a sua coleção.</p>
        <button className="btn btn-danger-outline btn-sm" onClick={excluirConta}>
          <Icone nome="trash" tamanho={14} /> Excluir minha conta
        </button>
      </section>
    </div>
  );
}
