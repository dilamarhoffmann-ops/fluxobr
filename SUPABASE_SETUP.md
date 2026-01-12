# 🚀 Configuração do Supabase - AgilePulse Dashboard

Este guia irá ajudá-lo a configurar o Supabase para o projeto AgilePulse Dashboard.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Node.js instalado
- Projeto AgilePulse Dashboard clonado

## 🔧 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: AgilePulse Dashboard
   - **Database Password**: Crie uma senha forte (guarde-a!)
   - **Region**: Escolha a região mais próxima
4. Clique em **"Create new project"**
5. Aguarde alguns minutos enquanto o projeto é provisionado

### 2. Obter Credenciais

1. No painel do projeto, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon/public key** (chave pública para uso no frontend)

### 3. Configurar Variáveis de Ambiente

1. No diretório raiz do projeto, copie o arquivo `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

2. Edite o arquivo `.env.local` e adicione suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

### 4. Criar Tabelas no Banco de Dados

Execute o seguinte SQL no **SQL Editor** do Supabase:

```sql
-- Tabela de usuários (perfis)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Política: Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabela de tarefas/sprints (exemplo)
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" 
  ON tasks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" 
  ON tasks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" 
  ON tasks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" 
  ON tasks FOR DELETE 
  USING (auth.uid() = user_id);
```

### 5. Configurar Autenticação

1. Vá em **Authentication** → **Providers**
2. Habilite **Email** (já vem habilitado por padrão)
3. Configure as opções:
   - ✅ Enable email confirmations (recomendado para produção)
   - ✅ Enable email change confirmations

### 6. Testar a Conexão

Reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

O projeto agora está conectado ao Supabase! 🎉

## 📚 Uso no Código

### Autenticação com Hook

```tsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  const handleLogin = async () => {
    const { error } = await signIn('email@example.com', 'password');
    if (error) console.error('Login error:', error);
  };

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <button onClick={signOut}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Operações de Banco de Dados

```tsx
import { db } from './lib/supabase';

// Buscar todas as tarefas
const { data: tasks, error } = await db.getAll('tasks');

// Criar nova tarefa
const { data, error } = await db.insert('tasks', {
  title: 'Nova tarefa',
  description: 'Descrição da tarefa',
  status: 'pending'
});

// Atualizar tarefa
const { data, error } = await db.update('tasks', taskId, {
  status: 'completed'
});

// Deletar tarefa
const { error } = await db.delete('tasks', taskId);
```

## 🔒 Segurança

- ✅ Nunca commite o arquivo `.env.local` (já está no `.gitignore`)
- ✅ Use sempre RLS (Row Level Security) nas tabelas
- ✅ A chave `anon` é segura para uso no frontend
- ❌ Nunca exponha a `service_role` key no frontend

## 📖 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [Guia de Database](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Problemas Comuns

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe e contém as variáveis corretas
- Reinicie o servidor de desenvolvimento após criar/editar o `.env.local`

### Erro de autenticação
- Verifique se as credenciais estão corretas no `.env.local`
- Confirme que o projeto Supabase está ativo e rodando

### Erro de permissão no banco de dados
- Verifique se as políticas RLS estão configuradas corretamente
- Confirme que o usuário está autenticado antes de fazer operações
