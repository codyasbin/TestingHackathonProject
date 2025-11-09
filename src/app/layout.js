// app/layout.jsx (or layout.js)
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "./providers/storeProvider";
import SocketProvider from "./providers/socketProvider";
import { ToastContainer } from "react-toastify";
import Header from "./components/header";
import AudioUnlockButton from "./components/AudioUnlockButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Sahayog - Connect and Assist',
  description: 'Sahayog is a platform to connect volunteers with people in need of assistance.',
  themeColor: '#0b77ff',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  applicationName: 'Sahayog',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sahayog',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SocketProvider>
          {/* <AudioUnlockButton /> */}
          <StoreProvider>{children}</StoreProvider>
        </SocketProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
