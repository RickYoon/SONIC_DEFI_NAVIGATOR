'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { serviceInfoMap } from '@/app/constants/services';

interface CenterPanelProps {
  serviceUrl?: string;
  currentStep: number;
}

interface IframeWalletInfo {
  address?: string;
  balance?: number;
  network?: string;
}

export interface ServiceInfo {
  name: string;
  description: string;
  features: string[];
  category: string;
  tvl?: string;
  chains: number;
  logoUrl?: string;
}

const CenterPanel: React.FC<CenterPanelProps> = ({ 
  serviceUrl,
  currentStep
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeWalletInfo, setIframeWalletInfo] = useState<IframeWalletInfo>({});
  const [iframeError, setIframeError] = useState<boolean>(false);
  const wallet = useWallet();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    if (serviceUrl) {
      if (serviceUrl.includes('app.silo.finance') || serviceUrl.includes('euler.finance')) {
        setIframeError(true);
      } else {
        setSelectedService(serviceUrl);
        setIframeError(false);
      }
    }
  }, [serviceUrl]);

  // 지갑 연결 상태 모니터링
  useEffect(() => {
    console.log('지갑 연결 상태 변경:', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toString(),
      connecting: wallet.connecting,
      disconnecting: wallet.disconnecting
    });
  }, [wallet.connected, wallet.publicKey, wallet.connecting, wallet.disconnecting]);

  // iframe으로부터 정보 수신
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!serviceUrl) return;

      try {
        const iframeOrigin = new URL(serviceUrl).origin;
        if (event.origin !== iframeOrigin) return;

        if (event.data.type === 'WALLET_INFO') {
          console.log('Received wallet info from iframe:', event.data);
          setIframeWalletInfo(event.data.data);
        }
        else if (event.data.type === 'WALLET_STATUS_CHANGE') {
          console.log('iframe 내부 지갑 상태 변경:', event.data.status);
        }
      } catch (error) {
        console.error('Error handling iframe message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [serviceUrl]);

  // iframe 로드 에러 핸들링
  const handleIframeError = () => {
    setIframeError(true);
  };

  // 새 창으로 열기
  const openInNewWindow = () => {
    if (serviceUrl) {
      window.open(
        serviceUrl.startsWith('http') ? serviceUrl : `https://${serviceUrl}`,
        '_blank'
      );
    }
  };

  // URL이 유효한지 확인
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  // 현재 서비스 정보 가져오기
  const getCurrentServiceInfo = () => {
    if (!serviceUrl) return null;
    try {
      const url = new URL(serviceUrl);
      const domain = url.hostname;
      return serviceInfoMap[domain];
    } catch {
      return null;
    }
  };

  // 서비스 정보 설명 생성
  const getServiceDescription = (): string => {
    if (!serviceUrl) return '';
    const domain = new URL(serviceUrl.startsWith('http') ? serviceUrl : `https://${serviceUrl}`).hostname;
    const service = serviceInfoMap[domain];
    if (!service) return '서비스 정보를 찾을 수 없습니다.';
    return `${service.name}\n\n${service.description}\n\n주요 기능:\n${service.features.join('\n')}\n\nTVL: ${service.tvl}`;
  };

  const features = [
    {
      name: 'Multi-Protocol Access',
      description: 'One-click access to all major Sonic DeFi protocols in a single dashboard',
      icon: '🔗',
    },
    {
      name: 'AI Strategy Analysis',
      description: 'Get personalized investment strategies analyzed and recommended by AI',
      icon: '🎯',
    },
    {
      name: 'Real-time Analytics',
      description: 'Live monitoring and insights for your DeFi investments',
      icon: '📊',
    },
    {
      name: 'Guided Experience',
      description: 'Step-by-step assistance with AI companion',
      icon: '🤖',
    }
  ];

  if (!selectedService) {
    return (
      <div className="flex-1 bg-[#0F1117] p-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-20 mb-32">
            {/* 왼쪽: 텍스트 섹션 */}
            <div className="space-y-6">
              <h1 className="text-7xl font-bold text-white leading-tight tracking-tight">
                The sonic<br/>
                DeFi Navigator<br/>
              </h1>
              <p className="text-xl text-gray-400 mt-6">
              AI-powered DeFi Navigator that simplifies multi-protocol investment on sonic through conversational guidance and real-time yield tracking.
              </p>
              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => window.postMessage({ type: 'START_CHAT', message: '안녕하세요! 솔라나 디파이 투자를 시작하고 싶습니다.' }, '*')}
                  className="px-8 py-4 bg-[#98FB98] text-black font-semibold rounded-lg hover:bg-[#7bfa7b] transition-colors"
                >
                  Start with AI
                </button>
                <button 
                  className="px-8 py-4 bg-[#1A1B1E] text-white font-semibold rounded-lg hover:bg-[#2A2B2E] transition-colors"
                >
                  Read Documentation
                </button>
              </div>
            </div>

            {/* 오른쪽: AI 네비게이터 로봇과 대시보드 */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#1A1B1E] rounded-3xl" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#98FB98]/5 via-[#98FB98]/10 to-transparent rounded-3xl" />
              <div className="relative w-full h-full flex items-center justify-center">
                {/* 대시보드 패널 */}
                <div className="absolute top-12 right-12 w-48 h-32 bg-[#1A1B1E]/80 rounded-lg border border-[#98FB98]/20 backdrop-blur-sm">
                  {/* 차트 라인 */}
                  <svg width="192" height="128" viewBox="0 0 192 128" fill="none" className="absolute top-0 left-0">
                    <path d="M0 96L32 80L64 88L96 64L128 72L160 48L192 32" stroke="#98FB98" strokeWidth="1.5" opacity="0.4"/>
                    <path d="M0 64L32 72L64 56L96 80L128 48L160 64L192 40" stroke="#98FB98" strokeWidth="1" opacity="0.2"/>
                  </svg>
                </div>
                
                {/* 왼쪽 패널 */}
                <div className="absolute top-12 left-12 w-32 h-48 bg-[#1A1B1E]/80 rounded-lg border border-[#98FB98]/20 backdrop-blur-sm">
                  {/* 데이터 포인트 */}
                  <div className="p-4 space-y-4">
                    <div className="h-2 w-16 bg-[#98FB98]/20 rounded"/>
                    <div className="h-2 w-20 bg-[#98FB98]/30 rounded"/>
                    <div className="h-2 w-12 bg-[#98FB98]/20 rounded"/>
                  </div>
                </div>

                {/* 로봇 */}
                <div className="relative z-10">
                  <svg width="160" height="160" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* 로봇 본체 */}
                    <rect x="6" y="7" width="12" height="13" rx="6" fill="#1A1B1E" stroke="#98FB98" strokeWidth="1.5"/>
                    
                    {/* 눈 */}
                    <circle cx="10" cy="13" r="1" fill="#98FB98"/>
                    <circle cx="14" cy="13" r="1" fill="#98FB98"/>
                    
                    {/* 안테나 */}
                    <line x1="12" y1="7" x2="12" y2="4" stroke="#98FB98" strokeWidth="1.5"/>
                    <circle cx="12" cy="3" r="1" fill="#98FB98"/>
                  </svg>
                </div>

                {/* 홀로그램 효과 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full bg-gradient-to-t from-[#98FB98]/5 to-transparent blur-xl"/>
                </div>

                {/* 데이터 흐름 라인 */}
                <svg width="400" height="400" viewBox="0 0 400 400" fill="none" className="absolute">
                  <path d="M200 100v200" stroke="#98FB98" strokeWidth="1" strokeDasharray="4 4" opacity="0.2"/>
                  <path d="M100 200h200" stroke="#98FB98" strokeWidth="1" strokeDasharray="4 4" opacity="0.2"/>
                  <path d="M140 140l120 120" stroke="#98FB98" strokeWidth="1" strokeDasharray="4 4" opacity="0.1"/>
                  <path d="M140 260l120-120" stroke="#98FB98" strokeWidth="1" strokeDasharray="4 4" opacity="0.1"/>
                </svg>
              </div>
            </div>
          </div>

          {/* 프로세스 단계 섹션 */}
          <div className="relative mt-8 mb-16">
            {/* 프로세스 연결 라인 */}
            <div className="absolute top-1/2 left-0 w-full h-0.5">
              <svg width="100%" height="2">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#98FB98" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#98FB98" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#98FB98" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="1" x2="100%" y2="1" stroke="url(#gradient)" strokeWidth="2"/>
              </svg>
            </div>

            {/* 프로세스 스텝 */}
            
          </div>

          {/* 특징 섹션 */}
          <div className="grid grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className="group relative overflow-hidden"
                style={{
                  transform: `translateX(${index % 2 === 0 ? '0' : '40px'})`,
                }}
              >
                <div className="bg-[#1A1B1E]/50 backdrop-blur-sm p-8 rounded-2xl">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 flex items-center justify-center text-2xl bg-[#2A2B2E] rounded-xl">
                      {feature.icon}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-semibold text-white/90">
                        {feature.name}
                      </h3>
                      <p className="text-gray-400 text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#1E1F2E] h-screen flex flex-col">
      {serviceUrl && isValidUrl(serviceUrl) && (
        <div className="flex items-center gap-4 p-4 bg-[#1A1B1E] border-b border-[#98FB98]/10">
          <div className="flex items-center gap-3 bg-[#2A2B2E] rounded-lg px-4 py-3 flex-1 min-w-[240px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#98FB98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
            <span className="text-white/90 text-sm flex-1 font-medium">{serviceUrl}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={openInNewWindow}
              className="p-2.5 rounded-lg bg-[#2A2B2E] hover:bg-[#3A3B3E] text-[#98FB98] transition-colors"
              title="새 창에서 열기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            <button
              onClick={() => alert(getServiceDescription())}
              className="p-2.5 rounded-lg bg-[#2A2B2E] hover:bg-[#3A3B3E] text-[#98FB98] transition-colors"
              title="서비스 정보"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {iframeError ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white space-y-4">
          <div className="text-xl font-bold">이 서비스는 직접 연동이 제한되어 있습니다</div>
          <p className="text-gray-400 text-center max-w-md">
            보안 정책으로 인해 현재 창에서 직접 접근이 불가능합니다.<br/>
            아래 버튼을 클릭하여 새 창에서 서비스를 이용해주세요.
          </p>
          <button
            onClick={openInNewWindow}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새 창에서 열기
          </button>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={selectedService}
          className="flex-1 w-full"
          style={{ border: 'none' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-storage-access-by-user-activation"
          onError={handleIframeError}
        />
      )}
    </div>
  );
};

export default CenterPanel; 