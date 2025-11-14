import { ArrowRight, BarChart3, ShieldCheck, Smartphone, Sparkles, Users } from "lucide-react"
import { HeroSection } from "@/components/landing/hero-section"
import { MetricsStrip } from "@/components/landing/metrics-strip"
import { ShowcasePanels } from "@/components/landing/showcase-panels"
import { ExperienceFlow } from "@/components/landing/experience-flow"
import { FeatureGallery } from "@/components/landing/feature-gallery"
import { FaqSection } from "@/components/landing/faq-section"
import { FinalCTA } from "@/components/landing/final-cta"

const heroHighlights = [
  { label: "Usuários ativos", value: "+1.200 equipes" },
  { label: "Finanças gerenciadas", value: "R$ 480 milhões" },
  { label: "Disponível em", value: "Desktop e Mobile" },
]

const proofHighlights = [
  {
    title: "+1.200 equipes conectadas",
    description: "Empreendedores e times financeiros confiam na plataforma para controlar tudo em um só lugar.",
  },
  {
    title: "R$ 480 milhões sob gestão",
    description: "Segurança, precisão e performance para acompanhar cada transação em tempo real.",
  },
  {
    title: "Confiança e estabilidade",
    description: "Sistema validado, com auditoria interna e controle total de acesso e dados.",
  },
]

const showcaseIllustrations = [
  {
    title: "Visual elegante e intuitivo",
    description:
      "Inspirado na simplicidade da Apple, o design transmite confiança e clareza. Cada card reage suavemente, destacando o essencial.",
    media: {
      src: "/opengraph-image.png",
      alt: "Preview do dashboard financeiro",
    },
  },
  {
    title: "Controle total em um só lugar",
    description:
      "Gerencie cartões, categorias, alertas e relatórios de maneira centralizada, sem depender de integrações externas.",
    media: {
      src: "/placeholder.jpg",
      alt: "Painel de controle financeiro premium",
    },
  },
]

const experienceFlow = [
  {
    title: "1. Comece grátis",
    description: "Explore o painel completo sem custo. Teste todas as funções essenciais e veja o poder do sistema.",
    footnote: "Início",
  },
  {
    title: "2. Evolua com propósito",
    description: "No plano Pro você libera relatórios avançados, automações e alertas inteligentes.",
    footnote: "Crescimento",
  },
  {
    title: "3. Experiência Premium",
    description: "Tudo o que há de mais moderno em controle financeiro, personalização e gestão multiusuário.",
    footnote: "Excelência",
  },
]

const features = [
  {
    icon: ShieldCheck,
    title: "Segurança e privacidade",
    description: "Proteção total de dados, acesso restrito e auditoria de atividades em todos os planos.",
  },
  {
    icon: Sparkles,
    title: "Automação inteligente",
    description: "Alertas automáticos, previsões e relatórios gerados com base no seu uso real.",
  },
  {
    icon: BarChart3,
    title: "Relatórios visuais",
    description: "Compare períodos, identifique padrões e visualize a evolução financeira com clareza.",
  },
  {
    icon: Smartphone,
    title: "Acesso em qualquer dispositivo",
    description: "Painel responsivo e fluido — controle suas finanças do computador, tablet ou celular.",
  },
  {
    icon: Users,
    title: "Gestão colaborativa",
    description: "Adicione membros da equipe e mantenha cada operação sob supervisão total.",
  },
  {
    icon: ArrowRight,
    title: "Planos flexíveis",
    description: "Free (R$0), Pro (R$39,90/mês) e Premium (R$79,90/mês). Cresça conforme sua necessidade.",
  },
]

const faqItems = [
  {
    question: "Posso começar grátis?",
    answer:
      "Sim! O plano Free inclui todas as ferramentas essenciais. Você pode fazer upgrade a qualquer momento para desbloquear mais recursos.",
  },
  {
    question: "Preciso instalar algo?",
    answer: "Não. O sistema é 100% web, pronto para uso em qualquer navegador moderno.",
  },
  {
    question: "O suporte é rápido?",
    answer:
      "Nos planos Pro e Premium, o suporte é priorizado, com acompanhamento técnico e respostas ágeis por e-mail.",
  },
  {
    question: "Como meus dados são protegidos?",
    answer:
      "Seguimos as boas práticas de segurança e proteção de dados, com criptografia e auditoria contínua.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim. Você tem total liberdade para cancelar a assinatura a qualquer momento, sem taxas ou bloqueios.",
  },
]

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <HeroSection highlights={heroHighlights} />
      <MetricsStrip items={proofHighlights} />
      <ShowcasePanels panels={showcaseIllustrations} />
      <ExperienceFlow steps={experienceFlow} />
      <FeatureGallery features={features} />
      <FaqSection items={faqItems} />
      <FinalCTA />
    </main>
  )
}
