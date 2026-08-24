import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ClickSalud ERP - Software Integral para Médicos e IPS',
  description: 'Plataforma ERP de Gestión Médica, Historia Clínica Electrónica, Facturación RIPS y Contabilidad en Colombia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
