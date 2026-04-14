export const metadata = { title: "Conditions générales — Tinda Cash" };

export default function TermsPage() {
  return (
    <>
      <h1>Conditions générales d&apos;utilisation</h1>
      <p className="text-white/50">Dernière mise à jour : avril 2026</p>

      <h2>1. Phase pilote</h2>
      <p>
        Tinda Cash est actuellement en <strong>phase pilote</strong>. Le service opère en mode
        concierge : chaque transfert est revu et exécuté manuellement par notre équipe avant
        d&apos;être confirmé au bénéficiaire. L&apos;incorporation en tant qu&apos;établissement de
        paiement européen est planifiée à l&apos;issue de cette phase.
      </p>

      <h2>2. Qui peut utiliser le service</h2>
      <p>
        L&apos;utilisateur doit être âgé d&apos;au moins 18 ans, résident légal d&apos;un pays
        où Tinda Cash opère, et capable de contracter légalement. Toute utilisation frauduleuse,
        déclaration d&apos;identité fausse ou contournement des contrôles KYC entraîne la
        suspension immédiate du compte.
      </p>

      <h2>3. Vérification d&apos;identité (KYC)</h2>
      <p>
        Conformément à la directive (UE) 2015/849 (AMLD), une vérification d&apos;identité est
        requise avant tout transfert supérieur à 150 €. La vérification est assurée par notre
        partenaire Onfido (ISO 27001, RGPD-compliant). Les données biométriques ne sont pas
        conservées au-delà de la durée strictement nécessaire à la validation.
      </p>

      <h2>4. Limites de transfert</h2>
      <ul>
        <li>Utilisateur non vérifié : max 150 € par transaction, 1 000 € par mois.</li>
        <li>Utilisateur vérifié : max 5 000 € par transaction, 10 000 € par mois.</li>
        <li>Au-delà, contactez le support pour validation renforcée.</li>
      </ul>

      <h2>5. Frais et taux de change</h2>
      <p>
        Les frais applicables sont affichés avant confirmation de chaque transfert. Le taux de
        change affiché est valable au moment de l&apos;ordre et garanti si le paiement est
        complété dans les 10 minutes. Passé ce délai, le taux est recalculé.
      </p>

      <h2>6. Délais de livraison</h2>
      <p>
        Délai indicatif : 5 à 15 minutes pour les mobile money, jusqu&apos;à 24 heures pour les
        virements bancaires. Les délais peuvent varier en fonction des contrôles anti-fraude et
        de la disponibilité des opérateurs partenaires.
      </p>

      <h2>7. Annulation et remboursement</h2>
      <p>
        Un transfert peut être annulé tant qu&apos;il est en statut « En attente » ou « Paiement
        reçu », via la page de reçu ou en contactant le support. Une fois le transfert exécuté,
        l&apos;annulation n&apos;est plus possible. En cas d&apos;échec d&apos;exécution côté
        partenaire, le remboursement intégral est effectué sur le moyen de paiement d&apos;origine
        sous 5 à 10 jours ouvrés.
      </p>

      <h2>8. Interdictions</h2>
      <p>
        L&apos;utilisation de Tinda Cash est strictement interdite pour : financement du
        terrorisme, blanchiment d&apos;argent, fraude, contournement de sanctions internationales,
        transactions liées à des activités illégales, jeux d&apos;argent non régulés, achat
        d&apos;armes ou de substances contrôlées.
      </p>

      <h2>9. Responsabilité</h2>
      <p>
        Tinda Cash ne pourra être tenu responsable des retards ou échecs causés par des
        circonstances hors de son contrôle, notamment : pannes des opérateurs de mobile money,
        restrictions de change imposées par les banques centrales locales, événements de force
        majeure.
      </p>

      <h2>10. Droit applicable</h2>
      <p>
        Les présentes conditions sont régies par le droit applicable du pays d&apos;incorporation
        de Tinda Cash. Tout litige sera soumis aux tribunaux compétents de ce ressort.
      </p>

      <h2>11. Contact</h2>
      <p>
        Pour toute question : <a href="mailto:support@tindacash.com">support@tindacash.com</a>
      </p>
    </>
  );
}
