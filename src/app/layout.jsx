import { Inter } from 'next/font/google';
import './globals.css';
import Auth from './Auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Certificate Portal',
  description: 'Professional Admin Portal for Certificate Management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Auth>
          {children}
        </Auth>
      </body>
    </html>
  );
}