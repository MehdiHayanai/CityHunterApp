import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { DashboardProvider } from "./context/DashboardContext";
import QuestManager from "./components/quest/QuestManager";
import AuthProvider from "./components/AuthProvider";
import QuestDevTools from "./components/quest/QuestDevTools";
import QuestEncounterModal from "./components/quest/QuestEncounterModal";
import QuestCompletionModal from "./components/quest/QuestCompletionModal";
import QuestProximityPopup from "./components/quest/QuestProximityPopup";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CityHunter | The Smart Compass for the Urban Explorer",
  description:
    "Don’t Just Visit. Play the City. The interactive guide for the modern explorer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* FontAwesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${robotoMono.variable} font-sans antialiased overflow-x-hidden selection:bg-accent selection:text-black`}
      >
        <ThemeProvider>
          <AuthProvider>
            <DashboardProvider>
            <QuestManager />
            <QuestEncounterModal />
            <QuestCompletionModal />
            <QuestProximityPopup />
            <QuestDevTools />
            {children}
            </DashboardProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
