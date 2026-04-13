import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Toaster } from "sonner";
import AIAssistant from "@/components/AIAssistant";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s — Tinda Cash",
    default: "Tinda Cash — Transferts instantanés Congo RDC & Angola",
  },
  description:
    "Envoyez de l'argent instantanément vers le Congo RDC et l'Angola via M-Pesa, Airtel Money, Multicaixa Express. Frais à partir de 0.5%. Propulsé par l'IA multi-agent.",
  keywords: [
    "transfert argent congo",
    "envoyer argent angola",
    "transfert rdc",
    "m-pesa congo",
    "multicaixa express",
    "airtel money rdc",
    "envoi argent kinshasa",
    "envoi argent luanda",
    "tinda cash",
    "diaspora congolaise",
    "diaspora angolaise",
  ],
  authors: [{ name: "Tinda Cash" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Tinda Cash — Transferts instantanés Congo RDC & Angola",
    description: "Envoyez de l'argent en 5 minutes. Frais imbattables. IA multi-agent.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tinda Cash — Congo RDC & Angola",
    description: "Transferts instantanés via M-Pesa, Multicaixa Express. IA multi-agent.",
  },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050A18",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased`}>
        <I18nProvider>
        {children}
        <AIAssistant />
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(10,14,26,0.90)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            },
          }}
        />
        </I18nProvider>
      </body>
    </html>
  );
}
