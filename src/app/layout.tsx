import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokémon Card Manager",
  description: "Gerencie sua coleção de cards Pokémon",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-950 text-white min-h-screen">{children}</body>
    </html>
  );
}