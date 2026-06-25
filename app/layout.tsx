import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../src/lib/CartContext";
import CartSidebar from "../src/components/layout/CartSidebar";
import CartFab from "../src/components/layout/CartFab";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kiyanna - Agentic Search & Discovery",
  description: "A generative UI e-commerce concierge",
  icons: {
    icon: "/k-logo.jpg",
    apple: "/k-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/k-logo.jpg" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body-md antialiased text-on-background">
        <CartProvider>
          {children}
          <CartSidebar />
          <CartFab />
        </CartProvider>
      </body>
    </html>
  );
}
