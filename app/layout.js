import "./globals.css";
import  UseContextProvider  from "./context/UseContextProvider";



export const metadata = {
  title: "Scholars Quiz",
  description: "Challange your intelligence with Scholars Quiz",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <UseContextProvider>
        {children}
        </UseContextProvider>
      </body>
    </html>
  );
}

