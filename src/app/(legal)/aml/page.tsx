export const metadata = { title: "Politique AML / Lutte anti-blanchiment — Tinda Cash" };

export default function AmlPage() {
  return (
    <>
      <h1>Politique de lutte anti-blanchiment (AML / CTF)</h1>
      <p className="text-white/50">Dernière mise à jour : avril 2026</p>

      <h2>1. Engagement</h2>
      <p>
        Tinda Cash s&apos;engage à prévenir activement toute utilisation de ses services à des
        fins de blanchiment d&apos;argent, de financement du terrorisme ou de contournement de
        sanctions internationales. Notre cadre de conformité s&apos;appuie sur les directives
        européennes AMLD4, AMLD5 et AMLD6, ainsi que sur les recommandations du GAFI (FATF).
      </p>

      <h2>2. Vérification du client (KYC / CDD)</h2>
      <p>
        Avant tout transfert supérieur à 150 €, nous procédons à une vérification d&apos;identité
        complète (Customer Due Diligence) via notre partenaire Onfido. Cette vérification inclut :
      </p>
      <ul>
        <li>Validation d&apos;un document d&apos;identité officiel (passeport, CNI, permis).</li>
        <li>Vérification biométrique par selfie avec détection de vivacité.</li>
        <li>Confirmation de l&apos;adresse et du numéro de téléphone.</li>
      </ul>

      <h2>3. Due diligence renforcée (EDD)</h2>
      <p>Une vérification renforcée est déclenchée dans les cas suivants :</p>
      <ul>
        <li>Transfert dépassant 5 000 € par transaction.</li>
        <li>Comportement transactionnel atypique ou incohérent.</li>
        <li>Client ou bénéficiaire identifié comme personne politiquement exposée (PPE).</li>
        <li>Pays à risque selon la liste FATF (haut risque, non-coopératifs).</li>
      </ul>

      <h2>4. Screening des sanctions</h2>
      <p>
        Chaque nom (expéditeur et bénéficiaire) est automatiquement comparé aux listes de
        sanctions : UE, OFAC, ONU, HMT (UK), ainsi qu&apos;à des listes de personnes
        politiquement exposées. Toute correspondance entraîne un blocage immédiat et une revue
        manuelle.
      </p>

      <h2>5. Surveillance continue</h2>
      <p>
        Les transactions sont surveillées en temps réel. Tout comportement suspect (montants
        fractionnés, corridors inhabituels, pattern de structuration) déclenche une alerte
        interne et, le cas échéant, une déclaration de soupçon auprès de l&apos;autorité
        compétente.
      </p>

      <h2>6. Conservation des données</h2>
      <p>
        Conformément à la directive AMLD, toutes les données KYC et l&apos;historique
        transactionnel sont conservés pendant 5 ans à compter de la clôture du compte ou de la
        dernière transaction.
      </p>

      <h2>7. Transactions interdites</h2>
      <p>
        Tinda Cash refuse catégoriquement toute transaction liée à :
      </p>
      <ul>
        <li>Terrorisme ou financement du terrorisme.</li>
        <li>Blanchiment de capitaux.</li>
        <li>Contournement de sanctions internationales.</li>
        <li>Trafic d&apos;êtres humains, drogues, armes, espèces protégées.</li>
        <li>Jeux d&apos;argent non régulés et fraude en ligne.</li>
        <li>Exploitation sexuelle et pornographie illégale.</li>
      </ul>

      <h2>8. Formation et gouvernance</h2>
      <p>
        L&apos;ensemble du personnel est formé régulièrement aux obligations AML. Un
        responsable conformité (MLRO) supervise la politique et les procédures. Les procédures
        sont revues annuellement ou à chaque évolution réglementaire.
      </p>

      <h2>9. Déclarations et coopération</h2>
      <p>
        Tinda Cash coopère pleinement avec les autorités compétentes et effectue les
        déclarations de soupçon (TRACFIN, NCA, FIU locales) conformément aux obligations légales.
      </p>

      <h2>10. Contact compliance</h2>
      <p>
        Pour toute question relative à notre politique AML :{" "}
        <a href="mailto:compliance@tindacash.com">compliance@tindacash.com</a>
      </p>
    </>
  );
}
