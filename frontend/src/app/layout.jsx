import "../styles/global.css";
import "../styles/tailwind.css";
import Providers from "../providers/Providers.jsx";
import ImageProtection from "../components/ui/ImageProtection.jsx";
import PageTitleManager from "../components/PageTitleManager.jsx";

export const metadata = {
  title: { default: "Tech Monster", template: "%s | Tech Monster" },
  description: "Tech Monster learning platform",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PageTitleManager />
        <ImageProtection />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}