export const metadata = { title: "Politique de confidentialité — Tinda Cash" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p className="text-white/50">Dernière mise à jour : avril 2026</p>

      <p>
        Cette politique explique comment Tinda Cash collecte, utilise et protège vos données
        personnelles conformément au Règlement (UE) 2016/679 (RGPD).
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement est Tinda Cash (phase pilote, incorporation européenne en
        cours). Contact DPO : <a href="mailto:privacy@tindacash.com">privacy@tindacash.com</a>.
      </p>

      <h2>2. Données collectées</h2>
      <ul>
        <li><strong>Identification</strong> : nom, prénom, date de naissance, nationalité, adresse.</li>
        <li><strong>Contact</strong> : email, numéro de téléphone.</li>
        <li><strong>Vérification d&apos;identité</strong> : photo de pièce d&apos;identité, selfie (via Onfido).</li>
        <li><strong>Paiement</strong> : jamais stocké par Tinda Cash. Les informations de carte sont traitées directement par notre prestataire PCI-DSS certifié (Stripe).</li>
        <li><strong>Transactions</strong> : historique des transferts, bénéficiaires, montants, devises.</li>
        <li><strong>Techniques</strong> : adresse IP, type d&apos;appareil, cookies de session.</li>
      </ul>

      <h2>3. Finalités du traitement</h2>
      <ul>
        <li>Exécution du service de transfert d&apos;argent (base : contrat).</li>
        <li>Respect des obligations légales anti-blanchiment (base : obligation légale AMLD).</li>
        <li>Lutte contre la fraude et sécurité des comptes (base : intérêt légitime).</li>
        <li>Amélioration du service et statistiques agrégées (base : intérêt légitime).</li>
        <li>Communications marketing (base : consentement — opt-in explicite requis).</li>
      </ul>

      <h2>4. Durée de conservation</h2>
      <ul>
        <li>Données d&apos;identification et KYC : 5 ans après clôture du compte (obligation AMLD).</li>
        <li>Transactions : 5 ans après la dernière opération.</li>
        <li>Cookies de session : 7 jours maximum.</li>
        <li>Données biométriques (Onfido) : supprimées après validation du document.</li>
      </ul>

      <h2>5. Destinataires</h2>
      <p>Vos données peuvent être partagées avec :</p>
      <ul>
        <li><strong>Onfido</strong> — vérification KYC (Royaume-Uni, ISO 27001).</li>
        <li><strong>Stripe</strong> — traitement des paiements par carte (Irlande, PCI-DSS).</li>
        <li><strong>Partenaires de payout locaux</strong> en Afrique (Yellow Card, Flutterwave) pour exécuter le transfert.</li>
        <li><strong>Autorités compétentes</strong> sur demande légale justifiée.</li>
      </ul>
      <p>
        Aucune donnée n&apos;est vendue ni cédée à des fins commerciales à des tiers.
      </p>

      <h2>6. Vos droits</h2>
      <p>Vous disposez des droits suivants :</p>
      <ul>
        <li>Accès, rectification, suppression de vos données.</li>
        <li>Limitation et opposition au traitement.</li>
        <li>Portabilité de vos données.</li>
        <li>Retrait du consentement à tout moment.</li>
        <li>Réclamation auprès de l&apos;autorité de contrôle (CNIL en France).</li>
      </ul>
      <p>
        Pour exercer ces droits :{" "}
        <a href="mailto:privacy@tindacash.com">privacy@tindacash.com</a>
      </p>

      <h2>7. Sécurité</h2>
      <p>
        Toutes les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). Les mots
        de passe sont hachés (bcrypt). L&apos;accès administrateur est protégé par
        authentification multi-facteurs.
      </p>

      <h2>8. Transferts hors UE</h2>
      <p>
        Certains sous-traitants (Stripe, partenaires de payout africains) peuvent traiter vos
        données hors de l&apos;UE. Ces transferts sont encadrés par les clauses contractuelles
        types de la Commission européenne.
      </p>
    </>
  );
}
