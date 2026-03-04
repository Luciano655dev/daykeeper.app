import "./globals.css"
import type { Metadata } from "next"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "Daykeeper",
  icons: {
    icon: "/logo-main.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var key = "dk-theme";
    var mode = localStorage.getItem(key) || "system";
    var root = document.documentElement;

    var resolved = mode;
    if (mode === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    if (resolved === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  } catch (e) {}
})();`,
          }}
        />
      </head>
      <body className="bg-(--dk-paper)" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
