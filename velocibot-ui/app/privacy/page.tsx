'use client'

import Link from 'next/link'

export default function PrivacyPage() {
    return (
        <main
            className="min-h-screen flex flex-col items-center px-6 py-16"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
        >
            <div className="max-w-2xl w-full">

                <div className="mb-12">
                    <h1
                        className="text-5xl font-black mb-3 tracking-tight"
                        style={{
                            color: 'var(--accent-gold)',
                            textShadow: '0 0 40px var(--accent-gold-bg)',
                        }}
                    >
                        Privacidade
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                        Última atualização: Abril de 2026 — leia, não é longo.
                    </p>
                </div>

                {[
                    {
                        title: 'O que o VelociBot coleta?',
                        content: 'Só o essencial: seu e-mail (via login Google ou cadastro direto) e o histórico das suas conversas. Sem rastreamento escondido, sem coleta de dados que não fazem sentido. Se não serve pra te ajudar a escrever código melhor, não tá aqui.',
                    },
                    {
                        title: 'Pra que servem esses dados?',
                        content: 'Manter seu histórico de conversas e personalizar a experiência. Nada é vendido, repassado ou usado pra te mostrar anúncio de curso de programação que você não pediu. Os dados ficam entre você e o dinossauro.',
                    },
                    {
                        title: 'Segurança',
                        content: 'Autenticação via Supabase com OAuth 2.0 pelo Google — o VelociBot não armazena senha nenhuma. Se alguém tentar invadir sua conta, vai ter que lidar com 66 milhões de anos de stack antes de chegar em qualquer dado seu.',
                    },
                    {
                        title: 'Cookies',
                        content: 'Usamos cookies apenas pra manter sua sessão ativa. Nada de cookie de rastreamento, pixel de conversão ou qualquer outra coisa que deixaria um dev sênior envergonhado.',
                    },
                    {
                        title: 'Seus direitos',
                        content: 'Você pode pedir exclusão dos seus dados a qualquer momento. Sem burocracia, sem formulário de 12 páginas. Manda um e-mail e resolve.',
                    },
                ].map((section, i) => (
                    <div key={i} className="privacy-card mb-4 rounded-xl px-6 py-5">
                        <h2
                            className="text-base font-bold mb-2 uppercase tracking-wider"
                            style={{ color: 'var(--accent-gold)' }}
                        >
                            {section.title}
                        </h2>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                            {section.content}
                        </p>
                    </div>
                ))}

                <div className="privacy-card-contact mb-10 px-6 py-5">
                    <h2
                        className="text-base font-bold mb-2 uppercase tracking-wider"
                        style={{ color: 'var(--accent-gold)' }}
                    >
                        Contato
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                        Dúvida, reclamação ou só quer falar com a criadora do dinossauro?{' '}
                        <a
                            href="https://github.com/lohjs-0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold"
                            style={{ color: 'var(--accent-gold)' }}
                        >
                            github.com/lohjs-0
                        </a>
                        . O VelociBot morde, mas a dev que o criou responde.
                    </p>
                </div>

                <Link href="/" className="privacy-back-btn">
                    ← Voltar pro VelociBot
                </Link>

            </div>
        </main>
    );
}