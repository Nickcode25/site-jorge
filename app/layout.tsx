import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "jorgesoares.com.br";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  return {
    metadataBase: new URL(origin),
    title: { default: "JLS Negócios Imobiliários | Imóveis em Viçosa", template: "%s | JLS Negócios Imobiliários" },
    description: "Curadoria de apartamentos, casas e lotes em Viçosa e região. Atendimento próximo e negociação transparente.",
    openGraph: { title: "JLS Negócios Imobiliários | Curadoria Imobiliária", description: "Seu próximo capítulo começa no lugar certo.", type: "website", locale: "pt_BR", images: [{ url: `${origin}/og.png`, width: 1672, height: 941, alt: "JLS Negócios Imobiliários — Curadoria Imobiliária" }] },
    twitter: { card: "summary_large_image", title: "JLS Negócios Imobiliários | Curadoria Imobiliária", description: "Seu próximo capítulo começa no lugar certo.", images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
