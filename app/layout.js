import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "XauCore RWA Dashboard",
  description: "Real World Asset Tokenization",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
