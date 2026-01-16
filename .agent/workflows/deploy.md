---
description: Como atualizar o sistema no Vercel e sincronizar o banco de dados
---

# Procedimento de Atualização do Sistema

Para garantir que o sistema esteja sempre atualizado no **Vercel** e em sincronia com o **Supabase**, siga os passos abaixo:

## 1. Atualizar o Código (Vercel)

O Vercel está configurado para monitorar o seu repositório no GitHub. Toda vez que você envia mudanças para a branch principal, o Vercel inicia uma nova build automaticamente.

// turbo
```bash
git add .
git commit -m "Descrição das atualizações realizadas"
git push
```

*   **Nota:** Após o `git push`, você pode acompanhar o progresso em [vercel.com](https://vercel.com).

## 2. Sincronizar Banco de Dados (Supabase CLI)

Se você realizou alterações na estrutura do banco de dados (tabelas, colunas, políticas RLS), use o comando do Supabase. 
*(Nota: O comando correto é **supabase**, não "subapase")*

Se você tiver migrações pendentes:
```bash
npx supabase db push
```

## 3. Comandos Úteis de Verificação

Se precisar verificar o status da sua implantação no Vercel via linha de comando:
```bash
npx vercel list
```

---
*Este procedimento garante que tanto a interface (Vercel) quanto o banco de dados (Supabase) estejam na versão mais recente.*
