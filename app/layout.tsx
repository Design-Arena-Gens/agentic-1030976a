import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stadium Baby Goal Show",
  description:
    "Animated experience of a baby scoring a goal and dancing to a playful tune inside a grand football stadium."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
