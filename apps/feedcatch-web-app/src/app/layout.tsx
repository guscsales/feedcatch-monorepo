import './global.scss';
import { League_Spartan } from 'next/font/google';
import Header from '@web/libs/components/header';
import Footer from '@web/libs/components/footer';

const sans = League_Spartan({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export const metadata = {
  title: 'Welcome to feedcatch',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable}`}>
        <Header />
        <main className="mt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
