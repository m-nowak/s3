import "./globals.css";
import { Providers } from "./providers"; // 👈 import here
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Auth App",
  description: "Next.js App with Auth",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
