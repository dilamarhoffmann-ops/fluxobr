# 📁 Estrutura do Projeto - Integração Supabase

```
agilepulse-dashboard/
├── 📄 .env.example                    # Template de variáveis de ambiente
├── 📄 .env.local                      # Suas credenciais (não commitado)
├── 📄 SUPABASE_SETUP.md              # Guia completo de configuração
│
├── 📂 lib/
│   └── 📄 supabase.ts                # Cliente Supabase + helpers
│
├── 📂 hooks/
│   └── 📄 useAuth.ts                 # Hook React para autenticação
│
├── 📂 types/
│   └── 📄 supabase.ts                # Tipos TypeScript do banco
│
└── 📂 components/
    └── 📄 SupabaseLogin.tsx          # Componente de login/registro

```

## ✅ Checklist de Configuração

### Instalação
- [x] Instalar `@supabase/supabase-js`
- [x] Criar estrutura de arquivos
- [x] Criar documentação

### Próximos Passos (Você precisa fazer)
- [ ] Criar projeto no Supabase (https://app.supabase.com)
- [ ] Copiar credenciais (URL + Anon Key)
- [ ] Configurar `.env.local` com suas credenciais
- [ ] Executar SQL para criar tabelas
- [ ] Testar autenticação

## 🎯 Como Usar

### 1. Configure as Variáveis de Ambiente

Edite o arquivo `.env.local` (já existe no projeto):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### 2. Use o Hook de Autenticação

```tsx
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, signIn, signOut } = useAuth();

  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sair</button>
      ) : (
        <button onClick={() => signIn('email@example.com', 'senha')}>
          Entrar
        </button>
      )}
    </div>
  );
}
```

### 3. Use o Componente de Login

```tsx
import { SupabaseLogin } from './components/SupabaseLogin';

function App() {
  return (
    <SupabaseLogin 
      onLoginSuccess={() => console.log('Login realizado!')} 
    />
  );
}
```

### 4. Operações de Banco de Dados

```tsx
import { db } from './lib/supabase';

// Buscar dados
const { data, error } = await db.getAll('tasks');

// Inserir dados
await db.insert('tasks', {
  title: 'Nova tarefa',
  status: 'pending'
});

// Atualizar
await db.update('tasks', taskId, { status: 'completed' });

// Deletar
await db.delete('tasks', taskId);
```

## 🔐 Recursos de Segurança

- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acesso por usuário
- ✅ Autenticação JWT
- ✅ Variáveis de ambiente protegidas
- ✅ Type-safe com TypeScript

## 📚 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `lib/supabase.ts` | Cliente Supabase configurado com helpers para auth, db e storage |
| `hooks/useAuth.ts` | Hook React para gerenciar estado de autenticação |
| `components/SupabaseLogin.tsx` | Componente completo de login/registro |
| `types/supabase.ts` | Tipos TypeScript para as tabelas do banco |
| `.env.example` | Template de variáveis de ambiente |
| `SUPABASE_SETUP.md` | Documentação completa de configuração |

## 🚀 Próximos Passos Recomendados

1. **Configurar Supabase**
   - Siga o guia em `SUPABASE_SETUP.md`
   - Configure as variáveis de ambiente

2. **Testar Autenticação**
   - Use o componente `SupabaseLogin`
   - Crie uma conta de teste

3. **Criar Tabelas Customizadas**
   - Adicione suas próprias tabelas no SQL Editor
   - Atualize os tipos em `types/supabase.ts`

4. **Integrar com App Existente**
   - Substitua o componente `Login` atual por `SupabaseLogin`
   - Use `useAuth` para proteger rotas

## 💡 Dicas

- Use o **SQL Editor** do Supabase para testar queries
- Habilite **RLS** em todas as tabelas para segurança
- Use o **Table Editor** para visualizar dados
- Configure **Email Templates** para personalizar emails de confirmação

## 🆘 Suporte

- [Documentação Supabase](https://supabase.com/docs)
- [Discord Supabase](https://discord.supabase.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)
