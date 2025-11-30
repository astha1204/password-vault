// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../components/AuthProvider';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  console.log('_app.tsx loaded successfully');
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}