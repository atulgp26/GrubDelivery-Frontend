import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "@/styles/globals.css";
import "@/app/globals.css";
import MainProvider from "@/components/providers/MainProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const inter = Inter({
	variable: "--font-primary",
	subsets: ["latin"],
});

import { APP_VERSION } from "@/lib/constants/app";

export const metadata: Metadata = {
	title: "Grubpac Food",
	description:
		"Grubpac Food is a food delivery platform that allows you to order food from your favorite restaurants.",
	icons: {
		icon: "/logomark.svg",
	},
	other: {
		version: APP_VERSION,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
			>
				<MainProvider>
					{children}
				</MainProvider>
			</body>
		</html>
	);
}
