'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import RightPanel from './components/layout/RightPanel'
import { WalletContextProvider } from './contexts/WalletContextProvider'
import CenterPanel from './components/layout/CenterPanel'
import LeftPanel from './components/layout/LeftPanel'
import { useState } from 'react'

const inter = Inter({ 
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
})

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const [selectedServiceUrl, setSelectedServiceUrl] = useState<string | undefined>(undefined);
	const [isAIChatVisible, setIsAIChatVisible] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [selectedService, setSelectedService] = useState<string | null>(null);


	const handleServiceSelect = (url: string | undefined) => {
		console.log("handleServiceSelect", url);
		setSelectedServiceUrl(url);
		// setSelectedService("Jito")
	};

	const toggleAIChat = () => {
		setIsAIChatVisible(!isAIChatVisible);
	};

	const handleStartInvestment = () => {
		// Implementation of handleStartInvestment
	};

	return (
		<html lang="ko">
			<head>
				<title>Fiver - Sonic DeFi Navigator</title>
				<link rel="shortcut icon" href="/images/fiver-logo.svg" />
				<meta
					name="description"
					content="Your personal DeFi navigator powered by AI"
				/>
				<meta
					property="og:title"
					content="Fiver - Sonic DeFi Navigator"
				/>
				<meta
					property="og:description"
					content="Your personal DeFi navigator powered by AI"
				/>
				<meta property="og:image" content="/images/title-card.png" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta
					name="twitter:title"
					content="Fiver - Sonic DeFi Navigator"
				/>
				<meta
					name="twitter:description"
					content="Your personal DeFi navigator powered by AI"
				/>
				<meta name="twitter:image" content="/images/title-card.png" />
			</head>
			<body className={`${inter.className} bg-gray-950`}>
				<WalletContextProvider>
					<main className="flex min-h-screen h-screen">
						<LeftPanel onServiceSelect={handleServiceSelect} onToggleAIChat={toggleAIChat} selectedService={selectedService} setSelectedService={setSelectedService} />
						<div className={`flex-1 relative transition-all duration-300 ${
							isAIChatVisible ? 'mr-[400px]' : 'mr-0'
						}`}>
							<CenterPanel serviceUrl={selectedServiceUrl} currentStep={currentStep} />
						</div>
						<div 
							className={`fixed top-0 right-0 h-full w-[400px] bg-gray-900 border-l border-gray-800 transform transition-all duration-300 ease-in-out ${
								isAIChatVisible ? 'translate-x-0' : 'translate-x-full'
							} ${
								isAIChatVisible ? 'opacity-100' : 'opacity-0'
							}`}
							style={{
								visibility: isAIChatVisible ? 'visible' : 'hidden',
								transitionProperty: 'transform, opacity, visibility'
							}}
						>
							<RightPanel onServiceSelect={handleServiceSelect} onStartInvestment={handleStartInvestment} setSelectedService={setSelectedService}/>
						</div>
					</main>
				</WalletContextProvider>
			</body>
		</html>
	)
}
