import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "Daykeeper",
  icons: {
    icon: "/logo-main.svg",
  },
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

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
      <body className={`${inter.className}  bg-(--dk-paper)`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
