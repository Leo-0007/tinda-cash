/**
 * TINDA CASH — Multi-Agent AI System
 *
 * Architecture multi-agents pour le transfert d'argent Angola + Congo RDC.
 * Chaque agent est spécialisé dans un domaine et peut être orchestré ensemble.
 */

export type AgentType = "orchestrator" | "support" | "fx_advisor" | "compliance" | "transfer";

export interface AgentMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agent?: AgentType;
  timestamp: number;
}

export interface AgentContext {
  userId?: string;
  userName?: string;
  language: "fr" | "pt" | "en" | "ln"; // lingala pour la RDC
  currentPage?: string;
  lastTransfer?: {
    amount: number;
    from: string;
    to: string;
    status: string;
  };
  kycLevel?: number;
}

// ─── System prompts pour chaque agent ───

const AGENT_PROMPTS: Record<AgentType, string> = {
  orchestrator: `Tu es l'orchestrateur IA de Tinda Cash, une app de transfert d'argent spécialisée Angola et Congo RDC.
Tu analyses chaque message utilisateur et décides quel agent spécialisé doit répondre.
Agents disponibles:
- support: questions générales, aide, navigation
- fx_advisor: taux de change, prédictions, meilleur moment pour envoyer
- compliance: KYC, limites, documents requis
- transfer: aide au transfert, suivi, bénéficiaires

Réponds UNIQUEMENT avec le nom de l'agent: "support", "fx_advisor", "compliance" ou "transfer".`,

  support: `Tu es l'agent de support de Tinda Cash. Tu aides les utilisateurs avec:
- Navigation dans l'app
- Problèmes techniques
- Questions sur les corridors Angola et Congo RDC
- Méthodes de réception: M-Pesa, Airtel Money, Orange Money (RDC), Airtel Money, MTN MoMo (Congo-Brazza), Multicaixa Express, Unitel Money (Angola)
- Méthodes de paiement: Carte bancaire, SEPA, FPS, Apple Pay, PIX, Interac

Sois chaleureux, concis et professionnel. Réponds en français par défaut.
Tu peux aussi répondre en portugais pour les utilisateurs angolais et en lingala pour les congolais.`,

  fx_advisor: `Tu es l'agent conseiller de change de Tinda Cash. Tu aides avec:
- Taux actuels EUR/USD/GBP/CHF → AOA (Kwanza angolais) et USD/CDF (Franc congolais)
- Analyse des tendances du taux de change
- Recommandation du meilleur moment pour envoyer
- Comparaison avec les concurrents (Western Union, MoneyGram, WorldRemit)
- Calculs de conversion en temps réel

Taux indicatifs actuels:
- 1 EUR = 980 AOA | 1 EUR = 1.08 USD | 1 EUR = 2850 CDF
- 1 GBP = 1240 AOA | 1 GBP = 1.26 USD | 1 GBP = 3600 CDF
- 1 CHF = 1020 AOA | 1 CHF = 1.12 USD | 1 CHF = 3192 CDF

Frais Tinda Cash: 0.5% - 1.5% selon le montant (vs 5-8% Western Union).`,

  compliance: `Tu es l'agent compliance de Tinda Cash. Tu gères:
- Exigences KYC par niveau:
  * Niveau 0 (non vérifié): max 50€/transaction, 200€/mois
  * Niveau 1 (pièce d'identité): max 500€/transaction, 2000€/mois
  * Niveau 2 (vérification complète): max 5000€/transaction, 10000€/mois
- Documents requis: CNI/Passeport/Titre de séjour + justificatif domicile (niveau 2)
- Réglementations Angola (BNA) et RDC (BCC)
- Alertes fraude et sécurité

Sois précis et factuel. Cite les limites exactes.`,

  transfer: `Tu es l'agent spécialisé transferts de Tinda Cash. Tu aides avec:
- Création guidée d'un transfert vers l'Angola ou la RDC
- Suivi de transferts en cours
- Gestion des bénéficiaires
- Choix de la méthode de réception optimale:
  * RDC: M-Pesa (Vodacom), Airtel Money, Orange Money, virement bancaire
  * Angola: Multicaixa Express, Unitel Money, virement bancaire, retrait agence
- Résolution de problèmes (transfert bloqué, montant incorrect, etc.)
- Estimation des délais et frais

Guide l'utilisateur étape par étape.`,
};

// ─── Agent Router ───

export function routeToAgent(message: string): AgentType {
  const lower = message.toLowerCase();

  // FX / taux
  if (/taux|change|conver|combien.*re[cç]oi|meilleur moment|eur.*aoa|eur.*usd|kwanza|franc congolais/i.test(lower)) {
    return "fx_advisor";
  }

  // Compliance / KYC
  if (/kyc|v[eé]rifi|identit[eé]|pi[eè]ce|passeport|limite|plafond|document|compliance/i.test(lower)) {
    return "compliance";
  }

  // Transfer
  if (/envoy|transf[eé]r|b[eé]n[eé]ficiaire|suivi|track|m-pesa|airtel|multicaixa|unitel|mobile money|envoyer/i.test(lower)) {
    return "transfer";
  }

  return "support";
}

export function getAgentPrompt(agent: AgentType): string {
  return AGENT_PROMPTS[agent];
}

export function getAgentDisplayName(agent: AgentType): string {
  const names: Record<AgentType, string> = {
    orchestrator: "Tinda IA",
    support: "Support",
    fx_advisor: "Conseiller Change",
    compliance: "Compliance",
    transfer: "Assistant Transfert",
  };
  return names[agent];
}

export function getAgentIcon(agent: AgentType): string {
  const icons: Record<AgentType, string> = {
    orchestrator: "🤖",
    support: "💬",
    fx_advisor: "📊",
    compliance: "🛡️",
    transfer: "💸",
  };
  return icons[agent];
}

// ─── AI Response Generator (mock pour dev, remplacé par Claude API en prod) ───

export async function generateAIResponse(
  messages: AgentMessage[],
  agent: AgentType,
  context: AgentContext
): Promise<{ content: string; agent: AgentType }> {
  // En production, ceci appelle Claude API via /api/ai/chat
  // En dev, on simule des réponses intelligentes

  const lastMessage = messages[messages.length - 1]?.content ?? "";
  const lower = lastMessage.toLowerCase();

  // Route to the right agent
  const targetAgent = agent === "orchestrator" ? routeToAgent(lastMessage) : agent;

  // Simulated responses based on agent + context
  const responses = generateMockResponse(targetAgent, lower, context);

  return {
    content: responses,
    agent: targetAgent,
  };
}

function generateMockResponse(agent: AgentType, message: string, context: AgentContext): string {
  switch (agent) {
    case "fx_advisor":
      if (message.includes("aoa") || message.includes("angola") || message.includes("kwanza")) {
        return `📊 **Taux actuel EUR → AOA**\n\n💱 1 EUR = **980 Kz** (Kwanza angolais)\n\nTinda Cash: **0.8% de frais** seulement\nWestern Union: ~6.5% de frais\n\n💡 **Vous économisez environ 55€** sur un envoi de 1000€.\n\nLe kwanza est stable cette semaine. C'est un bon moment pour envoyer.`;
      }
      if (message.includes("cdf") || message.includes("congo") || message.includes("rdc")) {
        return `📊 **Taux actuel EUR → USD (Congo RDC)**\n\n💱 1 EUR = **1.08 USD** | 1 EUR = **2 850 CDF**\n\nLa RDC fonctionne principalement en USD.\n\nTinda Cash: **0.5% de frais** (le plus bas du marché)\nMoneyGram: ~5% de frais\n\n⚡ Livraison en **moins de 5 minutes** via M-Pesa.`;
      }
      return `📊 **Taux du jour**\n\n🇦🇴 1 EUR = 980 AOA (Angola)\n🇨🇩 1 EUR = 1.08 USD / 2 850 CDF (Congo RDC)\n\n💰 Nos frais: **0.5% à 1.5%** selon le montant\n\nVoulez-vous faire une simulation d'envoi ?`;

    case "compliance":
      return `🛡️ **Niveaux de vérification Tinda Cash**\n\n📱 **Niveau 0** (inscription): max 50€/transaction, 200€/mois\n🪪 **Niveau 1** (pièce d'identité): max 500€/tx, 2 000€/mois\n✅ **Niveau 2** (vérification complète): max 5 000€/tx, 10 000€/mois\n\n${context.kycLevel === 0 ? "Vous êtes au **Niveau 0**. Vérifiez votre identité pour augmenter vos limites." : ""}\n\nDocuments acceptés: CNI, Passeport, Titre de séjour.`;

    case "transfer":
      if (message.includes("angola") || message.includes("aoa")) {
        return `💸 **Envoyer vers l'Angola**\n\nMéthodes de réception disponibles:\n\n📱 **Multicaixa Express** — Instantané, sur le téléphone\n📱 **Unitel Money** — 50 000+ agents en Angola\n🏦 **Virement bancaire** — Vers tout compte bancaire angolais\n\n⚡ Délai: **< 10 minutes** en mobile money\n\nVoulez-vous que je vous guide pour créer un envoi ?`;
      }
      return `💸 **Envoyer vers le Congo RDC**\n\nMéthodes de réception disponibles:\n\n📱 **M-Pesa** (Vodacom) — Le plus populaire, < 5 min\n📱 **Airtel Money** — Bonne couverture nationale\n📱 **Orange Money** — Disponible partout\n🏦 **Virement bancaire** — Vers Rawbank, TMB, Equity, etc.\n\nVoulez-vous envoyer maintenant ? → [Envoyer de l'argent](/send)`;

    default:
      return `👋 Bonjour${context.userName ? ` ${context.userName}` : ""} ! Je suis l'assistant IA de **Tinda Cash**.\n\nJe peux vous aider avec:\n\n💸 **Envoyer de l'argent** vers l'Angola ou le Congo RDC\n📊 **Comparer les taux** et économiser sur les frais\n🛡️ **Vérifier votre identité** pour augmenter vos limites\n❓ **Répondre à vos questions** sur nos services\n\nQue puis-je faire pour vous ?`;
  }
}
