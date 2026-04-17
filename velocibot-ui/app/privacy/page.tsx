import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-16">
            <div className="max-w-2xl w-full">

                <h1
                    className="text-4xl font-black mb-2 tracking-tight"
                    style={{ color: '#F5C000' }}
                >
                    Política de Privacidade
                </h1>
                <p className="text-sm mb-10" style={{ color: 'var(--foreground-subtle)' }}>
                    Última atualização: Abril de 2026 — leia, não é longo.
                </p>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#F5C000' }}>
                        O que o VelociBot coleta?
                    </h2>
                    <p className="text-sm leading-relaxed opacity-80">
                        Só o essencial: seu e-mail (via login Google ou cadastro direto) e o histórico
                        das suas conversas. Sem rastreamento escondido, sem coleta de dados que não
                        fazem sentido. Se não serve pra te ajudar a escrever código melhor, não tá aqui.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#F5C000' }}>
                        Pra que servem esses dados?
                    </h2>
                    <p className="text-sm leading-relaxed opacity-80">
                        Manter seu histórico de conversas e personalizar a experiência. Nada é vendido,
                        repassado ou usado pra te mostrar anúncio de curso de programação que você não pediu.
                        Os dados ficam entre você e o dinossauro.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#F5C000' }}>
                        Segurança
                    </h2>
                    <p className="text-sm leading-relaxed opacity-80">
                        Autenticação via Supabase com OAuth 2.0 pelo Google — o VelociBot não armazena
                        senha nenhuma. Se alguém tentar invadir sua conta, vai ter que lidar com 400
                        milhões de anos de stack antes de chegar em qualquer dado seu.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#F5C000' }}>
                        Cookies
                    </h2>
                    <p className="text-sm leading-relaxed opacity-80">
                        Usamos cookies apenas pra manter sua sessão ativa. Nada de cookie de rastreamento,
                        pixel de conversão ou qualquer outra coisa que deixaria um dev sênior envergonhado.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#F5C000' }}>
                        Seus direitos
                    </h2>
                    <p className="text-sm leading-relaxed opacity-80">
                        Você pode pedir exclusão dos seus dados a qualquer momento. Sem burocracia,
                        sem formulário de 12 páginas. Manda um e-mail e resolve.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#F5C000' }}>
                        Contato
                    </h2>
                    <p className="text-sm leading-relaxed opacity-80">
                        Dúvida, reclamação ou só quer falar com a criadora do dinossauro?{' '}
                        <a
                            href="https://github.com/lohjs-0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                            style={{ color: '#F5C000' }}
                        >
                            github.com/lohjs-0
                        </a>
                        . O VelociBot morde, mas a dev que o criou responde.
                    </p>
                </section>

                <Link
                    href="/"
                    className="inline-block text-sm underline underline-offset-2 hover:opacity-80 transition-opacity"
                    style={{ color: '#F5C000' }}
                >
                    ← Voltar pro VelociBot
                </Link>

            </div>
        </main>
    );
}