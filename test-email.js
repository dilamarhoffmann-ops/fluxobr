// Script de teste para envio de email via Edge Function
// Execute este script com: node test-email.js

// CONFIGURAÇÃO - Substitua com suas credenciais do Supabase
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';
const TEST_EMAIL = 'seu-email@exemplo.com';

// ============================================
// NÃO EDITE ABAIXO DESTA LINHA
// ============================================

async function testEmailSend() {
    console.log('🧪 Iniciando teste de envio de email...\n');

    // Validar configuração
    if (SUPABASE_URL.includes('SEU_PROJETO')) {
        console.error('❌ ERRO: Configure SUPABASE_URL com a URL do seu projeto');
        return;
    }

    if (SUPABASE_ANON_KEY.includes('SUA_ANON_KEY')) {
        console.error('❌ ERRO: Configure SUPABASE_ANON_KEY com sua chave anônima');
        return;
    }

    if (TEST_EMAIL.includes('exemplo.com')) {
        console.error('❌ ERRO: Configure TEST_EMAIL com um email válido');
        return;
    }

    try {
        const functionUrl = `${SUPABASE_URL}/functions/v1/notify-due-tasks?email=${encodeURIComponent(TEST_EMAIL)}`;

        console.log('📡 URL da função:', functionUrl);
        console.log('📧 Email de destino:', TEST_EMAIL);
        console.log('\n⏳ Enviando requisição...\n');

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        console.log('📊 Status HTTP:', response.status);
        console.log('📦 Resposta completa:', JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
            console.log('\n✅ SUCESSO! Email de teste enviado para', TEST_EMAIL);
            console.log('\n📬 Verifique sua caixa de entrada (e spam)');
        } else {
            console.log('\n❌ FALHA ao enviar email');
            console.log('Erro:', data.error || 'Erro desconhecido');

            if (data.result && data.result.error) {
                console.log('Detalhes:', data.result.error);
            }
        }

    } catch (error) {
        console.error('\n❌ ERRO na requisição:', error.message);
        console.error('Detalhes:', error);
    }
}

async function testFullNotification() {
    console.log('\n\n🔔 Testando notificação completa (tarefas vencidas)...\n');

    try {
        const functionUrl = `${SUPABASE_URL}/functions/v1/notify-due-tasks`;

        console.log('📡 URL da função:', functionUrl);
        console.log('\n⏳ Processando tarefas vencidas...\n');

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        console.log('📊 Status HTTP:', response.status);
        console.log('📦 Resposta completa:', JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
            console.log('\n✅ SUCESSO!');
            console.log(`📋 Tarefas processadas: ${data.processed}`);
            console.log(`🔍 Total verificado: ${data.total_tasks_checked}`);

            if (data.details && data.details.length > 0) {
                console.log('\n📧 Emails enviados:');
                data.details.forEach((detail, index) => {
                    console.log(`  ${index + 1}. ${detail.recipient} (${detail.type})`);
                });
            } else {
                console.log('\n📭 Nenhum email foi enviado (sem tarefas vencidas ou já notificadas)');
            }

            if (data.stats) {
                console.log('\n📊 Estatísticas (últimos 30 dias):');
                console.log(`  Total enviado: ${data.stats.total_sent}`);
                console.log(`  Total falhas: ${data.stats.total_failed}`);
                console.log(`  Taxa de sucesso: ${data.stats.success_rate}%`);
            }
        } else {
            console.log('\n❌ FALHA ao processar notificações');
            console.log('Erro:', data.error || 'Erro desconhecido');
        }

    } catch (error) {
        console.error('\n❌ ERRO na requisição:', error.message);
        console.error('Detalhes:', error);
    }
}

// Executar testes
(async () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('   TESTE DE NOTIFICAÇÕES POR EMAIL - FLUXOBR');
    console.log('═══════════════════════════════════════════════════\n');

    // Teste 1: Email simples
    await testEmailSend();

    // Aguardar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Teste 2: Notificação completa
    await testFullNotification();

    console.log('\n═══════════════════════════════════════════════════');
    console.log('   TESTES CONCLUÍDOS');
    console.log('═══════════════════════════════════════════════════\n');
})();
