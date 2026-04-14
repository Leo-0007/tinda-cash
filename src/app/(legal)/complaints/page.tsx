export const metadata = { title: "Procédure de réclamation — Tinda Cash" };

export default function ComplaintsPage() {
  return (
    <>
      <h1>Procédure de réclamation</h1>
      <p className="text-white/50">Dernière mise à jour : avril 2026</p>

      <h2>1. Principe</h2>
      <p>
        Tinda Cash s&apos;engage à traiter toute réclamation de manière équitable, rapide et
        transparente. Si vous n&apos;êtes pas satisfait d&apos;un aspect de notre service, vous
        pouvez déposer une réclamation gratuitement.
      </p>

      <h2>2. Comment déposer une réclamation</h2>
      <p>
        Vous pouvez nous contacter de l&apos;une des manières suivantes :
      </p>
      <ul>
        <li>
          <strong>Email</strong> :{" "}
          <a href="mailto:complaints@tindacash.com">complaints@tindacash.com</a>
        </li>
        <li>
          <strong>Formulaire de contact</strong> : disponible sur notre page d&apos;aide.
        </li>
      </ul>
      <p>
        Merci d&apos;inclure dans votre message : nom complet, email du compte, référence de la
        transaction concernée (le cas échéant), et description précise du problème.
      </p>

      <h2>3. Délais de traitement</h2>
      <ul>
        <li>Accusé de réception : sous 48 heures ouvrées.</li>
        <li>Réponse formelle : sous 15 jours ouvrés.</li>
        <li>Cas complexes : jusqu&apos;à 35 jours ouvrés (nous vous tiendrons informé).</li>
      </ul>

      <h2>4. Escalade</h2>
      <p>
        Si la réponse ne vous satisfait pas, ou en l&apos;absence de réponse dans les délais
        indiqués, vous pouvez saisir :
      </p>
      <ul>
        <li>
          En France : le médiateur de l&apos;AMF ou l&apos;ACPR (Autorité de contrôle prudentiel
          et de résolution).
        </li>
        <li>
          En Belgique : l&apos;Ombudsfin (médiateur financier).
        </li>
        <li>
          Au Royaume-Uni : le Financial Ombudsman Service (FOS).
        </li>
        <li>
          Dans l&apos;Union européenne : la plateforme européenne de règlement en ligne des
          litiges (ODR).
        </li>
      </ul>

      <h2>5. Registre des réclamations</h2>
      <p>
        Conformément aux obligations réglementaires, toutes les réclamations sont enregistrées
        dans un registre interne conservé pendant 5 ans. Ce registre fait l&apos;objet
        d&apos;analyses trimestrielles pour identifier les axes d&apos;amélioration.
      </p>

      <h2>6. Phase pilote — transparence</h2>
      <p>
        Tinda Cash étant en phase pilote, nous n&apos;avons pas encore de régulateur national
        dédié. Pendant cette période, nos engagements en matière de réclamation restent les
        mêmes, et notre équipe traite personnellement chaque cas. Notre objectif est de passer
        sous la supervision d&apos;un régulateur européen (Banque de Lituanie) à l&apos;issue de
        la phase pilote.
      </p>
    </>
  );
}
