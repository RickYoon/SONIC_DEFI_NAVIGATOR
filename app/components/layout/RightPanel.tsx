'use client';

import React, { useEffect } from 'react';
import { useChat } from 'ai/react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { serviceInfoMap } from '@/app/constants/services';

interface RightPanelProps {
  onServiceSelect: (url: string | undefined) => void;
  onStartInvestment: () => void;
  setSelectedService: (service: string | null) => void;
}

interface StepPhrases {
  [key: number]: string[];
}

interface StepServices {
  [key: number]: string;
}

const RightPanel: React.FC<RightPanelProps> = ({ onServiceSelect, onStartInvestment, setSelectedService }) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages
  } = useChat({
    api: "/api/chat",
    onResponse(response) {
      console.log('Full response object:', response);
    },
    streamMode: "text",
    onError: (e) => {
      toast(e.message, {
        theme: "dark",
      });
    },
    onFinish: async (message) => {
      const lastAiMessage = message;

      // Step confirmation phrases
      const stepPhrases: StepPhrases = {
        1: [
          '[💡 Please let me know when Step 1 is complete.]',
          '[💡 Please inform me when Step 1 is complete.]',
          '[💡 Please notify me when Step 1 is complete.]',
          '[💡 Tell me when Step 1 is complete.]'
        ],
        2: [
          '[💡 Please let me know when Step 2 is complete.]',
          '[💡 Please inform me when Step 2 is complete.]',
          '[💡 Please notify me when Step 2 is complete.]',
          '[💡 Tell me when Step 2 is complete.]'
        ],
        3: [
          '[💡 Please let me know when Step 3 is complete.]',
          '[💡 Please inform me when Step 3 is complete.]',
          '[💡 Please notify me when Step 3 is complete.]',
          '[💡 Tell me when Step 3 is complete.]'
        ],
        4: [
          '[💡 Please let me know when Step 4 is complete.]',
          '[💡 Please inform me when Step 4 is complete.]',
          '[💡 Please notify me when Step 4 is complete.]',
          '[💡 Tell me when Step 4 is complete.]'
        ]
      };

      // Service mapping for each step
      const stepServices: StepServices = {
        1: "raydium.io",
        2: "app.fragmetric.xyz/restake/",
        3: "app.rate-x.io/",
        4: "app.drift.trade/SOL-PERP"
      };

      // Check current step
      let currentStep = 0;
      for (const [step, phrases] of Object.entries(stepPhrases)) {
        if (phrases.some((phrase: string) => lastAiMessage?.content.includes(phrase))) {
          currentStep = parseInt(step);
          break;
        }
      }

      // Check if user response is positive
      const isPositiveResponse = input && (input.toLowerCase().includes('yes') || 
                                         input.toLowerCase().includes('complete') || 
                                         input.toLowerCase().includes('start') ||
                                         input.toLowerCase().includes('done'));

      if (currentStep > 0 && isPositiveResponse) {
        console.log(`Step ${currentStep} conditions met! Redirecting to ${stepServices[currentStep]}`);
        
        const serviceName = stepServices[currentStep];
        const service = serviceInfoMap[serviceName];
        
        if (service) {
          onServiceSelect(`https://${service.url}`);
          setSelectedService(service.name);
        }
      }
    }
  });

  // Create ref for scrollable div
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Execute scroll when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set initial message
  React.useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "0",
        role: "assistant",
        content: "I'm your DeFi protocol assistant. We provide step-by-step guidance to help you understand and use complex DeFi strategies. In the current version, we support delta-neutral investment strategies. Shall we begin?"
      }]);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'START_CHAT') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          content: event.data.message
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="fixed h-screen w-full bg-[#343541] text-white flex flex-col border-l border-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600'
                  : 'bg-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {/* Empty div for scroll positioning */}
        <div ref={messagesEndRef} />
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter your message..."
            className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-800"
          >
            Send
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RightPanel; 