import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletConnectButton } from "@/components/WalletConnectButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniAegis - AI-Powered Cross-Chain Defense on ZetaChain",
  description:
    "OmniAegis 提供动态跨链安全监控与保险，结合大模型风控与 ZetaChain 跨链执行，为多链资产提供主动防御。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-slate-950 text-slate-50">
          <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:px-10">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>OmniAegis</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-200">
                  ZetaChain Hackathon
                </span>
              </div>
              <nav className="flex items-center gap-4 text-xs md:text-sm">
                <a
                  href="/"
                  className="rounded-full px-3 py-1.5 text-slate-200 transition hover:bg-slate-900"
                >
                  首页
                </a>
                <a
                  href="/dashboard"
                  className="rounded-full px-3 py-1.5 text-slate-200 transition hover:bg-slate-900"
                >
                  仪表盘
                </a>
                <a
                  href="/security"
                  className="rounded-full px-3 py-1.5 text-slate-200 transition hover:bg-slate-900"
                >
                  安全指数
                </a>
                <a
                  href="/architecture"
                  className="rounded-full px-3 py-1.5 text-slate-200 transition hover:bg-slate-900"
                >
                  系统架构
                </a>
                <div className="ml-2">
                  <WalletConnectButton variant="compact" showError={false} />
                </div>
              </nav>
            </div>
          </header>
        {children}
        </div>
      </body>
    </html>
  );
}
