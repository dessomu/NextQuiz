import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import  UseContextProvider  from "./context/UseContextProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Scholars Quiz",
  description: "Challange your intelligence with Scholars Quiz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <UseContextProvider>
        {children}
        </UseContextProvider>
      </body>
    </html>
  );
}

