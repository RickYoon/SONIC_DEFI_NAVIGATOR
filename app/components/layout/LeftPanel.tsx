'use client';

// import { useWallet } from '@solana/wallet-adapter-react';
// import { WalletButton } from '../WalletButton';
import { useEffect, useState } from 'react';
import { ServiceInfo } from './CenterPanel';
import { serviceInfoMap } from '@/app/constants/services';
import { FavoriteService, getFavorites, addFavorite, removeFavorite, isFavorite } from '@/utils/favorites';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import TabSelector from './TabSelector';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LeftPanelProps {
  onServiceSelect: (url: string) => void;
  onToggleAIChat: () => void;
  selectedService: string | null;
  setSelectedService: (service: string | null) => void;
}

interface SortableItemProps {
  domain: string;
  info: ServiceInfo;
  isFavoriteItem: boolean;
  selectedService: string | null;
  onServiceClick: (url: string, name: string) => void;
  onFavoriteToggle: (domain: string, name: string, category: string) => void;
  isEditMode: boolean;
}

const renderProtocolItem = (
  domain: string,
  info: ServiceInfo,
  isFavoriteItem: boolean,
  selectedService: string | null,
  onServiceClick: (url: string, name: string) => void,
  onFavoriteToggle: (domain: string, name: string, category: string) => void
) => (
  <button
    onClick={() => onServiceClick(`https://${domain}`, info.name)}
    className={`block w-full p-3 text-left rounded-lg text-sm ${
      selectedService === info.name 
        ? 'bg-[#98FB98]/20 text-[#98FB98] border border-[#98FB98]/30' 
        : 'text-gray-300 hover:bg-gray-800 border border-transparent'
    }`}
  >
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {info.logoUrl ? (
            <Image
              src={info.logoUrl}
              alt={`${info.name} logo`}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-[#98FB98]">{info.name.charAt(0)}</span>
            </div>
          )}
          <span className="font-medium">{info.name}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(domain, info.name, info.category);
          }}
          className="p-1 hover:bg-gray-700 rounded"
        >
          {isFavorite(domain) ? (
            <StarIconSolid className="h-4 w-4 text-[#98FB98]" />
          ) : (
            <StarIcon className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>
      {isFavoriteItem ? (
        <>
          <div className="text-xs text-gray-400 line-clamp-2">{info.description}</div>
          <div className="flex items-center space-x-2 mt-2">
            <span className="px-2 py-1 bg-[#98FB98]/10 text-xs rounded-full text-[#98FB98]">
              {info.category}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="text-xs text-[#98FB98]">{info.category}</div>
          <div className="text-xs text-gray-400 line-clamp-2">{info.description}</div>
        </>
      )}
    </div>
  </button>
);

const SortableItem: React.FC<SortableItemProps> = ({ 
  domain, 
  info, 
  isFavoriteItem,
  selectedService,
  onServiceClick,
  onFavoriteToggle,
  isEditMode
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: domain });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {isEditMode && (
        <div 
          {...attributes} 
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-8 cursor-move flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </div>
      )}
      <div className={isEditMode ? "pl-8" : ""}>
        {renderProtocolItem(domain, info, isFavoriteItem, selectedService, onServiceClick, onFavoriteToggle)}
      </div>
    </div>
  );
};

const LeftPanel: React.FC<LeftPanelProps> = ({ onServiceSelect, onToggleAIChat, selectedService, setSelectedService }) => {
  const [activeTab, setActiveTab] = useState<'favorite' | 'protocols'>('favorite');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteService[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const categories = Object.entries(serviceInfoMap).reduce((acc, [domain, info]) => {
    const category = info.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ domain, info });
    return acc;
  }, {} as Record<string, { domain: string; info: ServiceInfo }[]>);

  const filteredCategories = Object.entries(categories).reduce((acc, [category, services]) => {
    const filteredServices = services.filter(({ info }) => 
      info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      info.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredServices.length > 0) {
      acc[category] = filteredServices;
    }
    return acc;
  }, {} as Record<string, { domain: string; info: ServiceInfo }[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleServiceClick = (url: string, name: string) => {
    onServiceSelect(url);
    setSelectedService(name);
  };

  const toggleFavorite = (domain: string, name: string, category: string) => {
    if (isFavorite(domain)) {
      removeFavorite(domain);
    } else {
      addFavorite({ domain, name, category });
    }
    setFavorites(getFavorites());
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      setFavorites((items) => {
        const oldIndex = items.findIndex((item) => item.domain === active.id);
        const newIndex = items.findIndex((item) => item.domain === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem('favorites', JSON.stringify(newItems));
        return newItems;
      });
    }
  };

  return (
    <div className="w-[350px] flex-shrink-0 bg-gray-900 p-6 min-h-screen overflow-y-auto scrollbar-hide border-r border-[#98FB98]/10">
      {/* Logo and AI Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <img src="/images/Fiver-logo.svg" alt="Fiver Logo" className="h-8" />
        </div>
        <div className="flex gap-2">
          {activeTab === 'favorite' && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                isEditMode 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          )}
          <button
            onClick={onToggleAIChat}
            className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            AI Guide
          </button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex space-x-4">
          {['favorite', 'protocols'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'favorite' | 'protocols')}
              className={`px-3 py-1 rounded-lg ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input - Only show in protocols tab */}
      {activeTab === 'protocols' && (
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search protocols..."
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {activeTab === 'favorite' && favorites.length === 0 ? (
        <div className="text-center text-gray-500 mt-4">
          No favorite protocols yet
        </div>
      ) : null}

      {/* Protocol List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'favorite' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={favorites.map(f => f.domain)}
              strategy={verticalListSortingStrategy}
            >
              {favorites.map((favorite) => {
                const serviceInfo = serviceInfoMap[favorite.domain];
                return serviceInfo ? (
                  <SortableItem
                    key={favorite.domain}
                    domain={favorite.domain}
                    info={serviceInfo}
                    isFavoriteItem={true}
                    selectedService={selectedService}
                    onServiceClick={handleServiceClick}
                    onFavoriteToggle={toggleFavorite}
                    isEditMode={isEditMode}
                  />
                ) : null;
              })}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="space-y-4">
            {Object.entries(filteredCategories).map(([category, services]) => (
              <div key={category} className="bg-gray-800 rounded-lg overflow-hidden">
                <button
                  className="w-full px-4 py-3 text-left text-white font-medium flex justify-between items-center hover:bg-gray-700"
                  onClick={() => toggleCategory(category)}
                >
                  <span>{category}</span>
                  <span className="transform transition-transform duration-200">
                    {expandedCategory === category ? '▼' : '▶'}
                  </span>
                </button>
                {expandedCategory === category && (
                  <div className="p-2 space-y-2">
                    {services.map(({ domain, info }) => renderProtocolItem(domain, info, false, selectedService, handleServiceClick, toggleFavorite))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel; 