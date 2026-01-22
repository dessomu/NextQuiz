import { Poppins } from "next/font/google";
import "./globals.css";
import UseContextProvider from "./context/UseContextProvider";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Scholars Quiz",
  description: "Challenge your intelligence with Scholars Quiz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <UseContextProvider>{children}</UseContextProvider>
      </body>
    </html>
  );
}

