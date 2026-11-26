import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "privacidade",
  description:
    "política de privacidade do Hermes, o assistente pessoal que uso para organizar rotina, prazos e agenda.",
};

/** Data da última revisão do texto. Atualize ao mexer no conteúdo. */
const ATUALIZADO_EM = "26 de novembro de 2026";

/** Permissões que o app pede na conta Google, com o escopo OAuth correspondente. */
const PERMISSOES: [string, string, string][] = [
  [
    "gmail.readonly",
    "ler e-mails",
    "identificar prazos, avisos da universidade e oportunidades de bolsa e estágio. o app não envia, não apaga e não altera mensagens.",
  ],
  [
    "calendar.readonly",
    "ler a agenda",
    "saber o que já está marcado antes de sugerir horários.",
  ],
  [
    "calendar.events",
    "criar e editar eventos",
    "agendar prazos, provas e compromissos que eu peço.",
  ],
];

export default function PrivacidadePage() {
  return (
    <main className="pt-24 pb-16 px-4 sm:px-8 max-w-3xl mx-auto flex flex-col gap-12">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] opacity-50 jetbrains-mono mb-2">
          hermes
        </p>
        <h1 className="jetbrains-mono font-bold text-3xl md:text-4xl tracking-tight">
          política de privacidade<span className="text-[color:var(--red)]">.</span>
        </h1>
        <p className="opacity-80 leading-relaxed mt-4">
          <span className="text-[color:var(--red)]">hermes</span> é um
          assistente pessoal de uso privado, que roda no meu próprio computador
          e me ajuda a organizar rotina, prazos e estudos. o aplicativo
          registrado no google cloud existe só para que esse assistente acesse a
          minha conta google. ele não é oferecido ao público: o único usuário
          sou eu, o dono da conta.
        </p>
        <p className="opacity-50 text-xs mt-3 jetbrains-mono">
          última atualização: {ATUALIZADO_EM}
        </p>
      </header>

      <section>
        <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
          {/* o que é acessado */}
          dados acessados
        </h2>
        <ul className="flex flex-col gap-3">
          {PERMISSOES.map(([escopo, titulo, motivo]) => (
            <li key={escopo} className="box-glass rounded-2xl p-4">
              <div className="font-medium">{titulo}</div>
              <div className="opacity-50 text-xs jetbrains-mono mt-1">
                {escopo}
              </div>
              <div className="opacity-80 text-sm mt-2 leading-relaxed">
                {motivo}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
          {/* uso e armazenamento */}
          uso e armazenamento
        </h2>
        <ul className="flex flex-col gap-2 text-sm opacity-80 leading-relaxed list-disc pl-5">
          <li>
            os dados servem apenas para organizar a minha própria rotina:
            prazos, provas, compromissos e estudos.
          </li>
          <li>
            as credenciais de acesso ficam guardadas somente no meu computador,
            em arquivos de acesso restrito. nenhum servidor meu recebe cópia.
          </li>
          <li>
            para gerar as respostas do assistente, trechos de e-mails e eventos
            podem ser processados pelo provedor do modelo de linguagem que eu
            contrato, segundo os termos desse provedor.
          </li>
          <li>
            os dados não são vendidos, não alimentam publicidade, não treinam
            modelos e não são compartilhados com terceiros.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
          {/* política do google */}
          uso limitado
        </h2>
        <p className="opacity-80 leading-relaxed text-sm">
          o uso e a transferência de informações recebidas das APIs do google
          seguem a{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer"
            className="text-[color:var(--red)] animated inline-flex items-center gap-1"
          >
            política de dados do usuário dos serviços de API do google
            <ArrowUpRight size={12} strokeWidth={1.6} />
          </a>
          , incluindo os requisitos de uso limitado.
        </p>
      </section>

      <section>
        <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
          {/* revogar */}
          como revogar o acesso
        </h2>
        <p className="opacity-80 leading-relaxed text-sm">
          o acesso pode ser revogado a qualquer momento em{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noreferrer"
            className="text-[color:var(--red)] animated inline-flex items-center gap-1"
          >
            myaccount.google.com/permissions
            <ArrowUpRight size={12} strokeWidth={1.6} />
          </a>
          . revogado o acesso, o assistente deixa de ler a conta na hora.
        </p>
      </section>

      <section>
        <h2 className="jetbrains-mono text-xs uppercase tracking-[0.2em] opacity-50 mb-4">
          {/* contato */}
          contato
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <a
              href="mailto:pessoa736@users.noreply.github.com"
              className="hover:text-[color:var(--red)] animated"
            >
              pessoa736@users.noreply.github.com
            </a>
          </li>
          <li>
            <a
              href="https://github.com/pessoa736"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[color:var(--red)] animated inline-flex items-center gap-1"
            >
              github.com/pessoa736
              <ArrowUpRight size={12} strokeWidth={1.6} />
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
