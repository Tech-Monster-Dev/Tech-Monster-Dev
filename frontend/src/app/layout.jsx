import "../styles/global.css";
import "../styles/tailwind.css";
import Providers from "../providers/Providers.jsx";

export const metadata = {
  title: "Tech Monster",
  description: "Tech Monster learning platform",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}