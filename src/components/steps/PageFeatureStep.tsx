import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Input from '../shared/Input';
import Checkbox from '../shared/Checkbox';
import StepNavigation from './StepNavigation';
import Button from '../shared/Button';
import AnimatedContainer from '../shared/AnimatedContainer';
import { 
  Check, Plus, X, Sparkles, Home, User, Settings, Bell, 
  Camera, MessageSquare, ShoppingCart, Calendar, Search,
  Image, Bot, Upload, Share2, Code, Globe, MapPin, 
  Wifi, Shield, Database, Smartphone, Users, Coins, 
  UserCheck, CreditCard
} from 'lucide-react';

const PageFeatureStep: React.FC = () => {
  const { selections, updateSelection } = useAppContext();
  const [currentPage, setCurrentPage] = useState('');
  const [currentFeature, setCurrentFeature] = useState('');

  // Predefined page suggestions
  const handlePreselectedPages = [
    { name: 'Home', icon: <Home size={16} /> },
    { name: 'Profile', icon: <User size={16} /> },
    { name: 'Settings', icon: <Settings size={16} /> },
    { name: 'Notifications', icon: <Bell size={16} /> },
    { name: 'Messages', icon: <MessageSquare size={16} /> }
  ];

  // Technical features with icons
  const predefinedAiFeatures = [
    { name: 'Image Generation', icon: <Image size={16} /> },
    { name: 'Language Support', icon: <Globe size={16} /> },
    { name: 'Membership System', icon: <Users size={16} /> },
    { name: 'Token Usage', icon: <Coins size={16} /> },
    { name: 'Notification Feature', icon: <Bell size={16} /> },
    { name: 'AI Chatbot', icon: <Bot size={16} /> },
    { name: 'User Authentication', icon: <UserCheck size={16} /> },
    { name: 'Payment Integration', icon: <CreditCard size={16} /> },
    { name: 'File Upload', icon: <Upload size={16} /> },
    { name: 'Social Media Sharing', icon: <Share2 size={16} /> },
    { name: 'GPS/Location Services', icon: <MapPin size={16} /> },
    { name: 'Offline Support', icon: <Wifi size={16} /> }
  ];

  const handleAddPage = () => {
    if (currentPage.trim() && !selections.pages.includes(currentPage.trim())) {
      updateSelection('pages', [...selections.pages, currentPage.trim()]);
      setCurrentPage('');
    }
  };

  const handleAddPreselectedPage = (pageName: string) => {
    if (!selections.pages.includes(pageName)) {
      updateSelection('pages', [...selections.pages, pageName]);
    }
  };

  const handleRemovePage = (pageToRemove: string) => {
    updateSelection('pages', selections.pages.filter(p => p !== pageToRemove));
  };

  const handleAddFeature = () => {
    if (currentFeature.trim() && !selections.features.includes(currentFeature.trim())) {
      updateSelection('features', [...selections.features, currentFeature.trim()]);
      setCurrentFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove: string) => {
    updateSelection('features', selections.features.filter(f => f !== featureToRemove));
  };

  const handleAddPredefinedAiFeature = (featureName: string) => {
    if (!selections.features.includes(featureName)) {
      updateSelection('features', [...selections.features, featureName]);
    }
  };

  return (
    <AnimatedContainer staggerChildren={true} staggerDelay={200} className="space-y-6">
      <Input
        label="Your Application Name"
        placeholder=""
        value={selections.appName}
        onChange={(e) => updateSelection('appName', e.target.value)}
      />
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Main Pages/Screens</label>
        
        {/* Predefined page suggestions */}
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center justify-center mb-3">
            <Sparkles size={16} className="text-blue-600 mr-2" />
            <p className="text-sm font-medium text-slate-700">Suggested Pages (click to add)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {handlePreselectedPages.map(page => {
              const isAlreadyAdded = selections.pages.includes(page.name);
              return (
                <button 
                  key={page.name} 
                  onClick={() => handleAddPreselectedPage(page.name)}
                  disabled={isAlreadyAdded}
                  className={`px-3 py-3 rounded-lg text-sm border transition-all duration-200 flex flex-col items-center justify-center text-center
                             ${isAlreadyAdded 
                               ? 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed' 
                               : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 border-blue-300 hover:border-blue-500 shadow-sm hover:shadow-md cursor-pointer'
                             }`}
                >
                  {isAlreadyAdded ? (
                    <>
                      <Check size={18} className="mb-1" />
                      <span className="text-xs">{page.name}</span>
                    </>
                  ) : (
                    <>
                      {React.cloneElement(page.icon, { size: 18, className: "mb-1" })}
                      <span className="text-xs">{page.name}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-2">
          <Input 
            value={currentPage} 
            onChange={(e) => setCurrentPage(e.target.value)} 
            placeholder="e.g., Home, Profile, Settings" 
            wrapperClassName="flex-grow mb-0"
            onKeyPress={(e) => e.key === 'Enter' && handleAddPage()}
          />
          <Button onClick={handleAddPage} size="sm" variant="outline" className="shadow-md hover:shadow-lg">
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {selections.pages.map(page => (
            <span key={page} className="bg-[#F26545]/20 text-[#F26545] px-3 py-2 rounded-lg text-sm flex items-center shadow-sm border border-[#F26545]/30">
              <Check size={14} className="mr-2" />
              {page}
              <button onClick={() => handleRemovePage(page)} className="ml-2 text-[#F26545] hover:text-orange-600 transition-colors">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Core Features</label>
        
        {/* Technical Features with Icons */}
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 shadow-sm">
          <div className="flex items-center justify-center mb-3">
            <Sparkles size={16} className="text-purple-600 mr-2" />
            <p className="text-sm font-medium text-slate-700">Technical Features (click to add)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {predefinedAiFeatures.map(feature => {
              const isAlreadyAdded = selections.features.includes(feature.name);
              return (
                <button 
                  key={feature.name} 
                  onClick={() => handleAddPredefinedAiFeature(feature.name)}
                  disabled={isAlreadyAdded}
                  className={`px-3 py-3 rounded-lg text-sm border transition-all duration-200 flex flex-col items-center justify-center text-center
                             ${isAlreadyAdded 
                               ? 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed' 
                               : 'bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-800 border-purple-300 hover:border-purple-500 shadow-sm hover:shadow-md cursor-pointer'
                             }`}
                >
                  {isAlreadyAdded ? (
                    <>
                      <Check size={18} className="mb-1" />
                      <span className="text-xs">{feature.name}</span>
                    </>
                  ) : (
                    <>
                      {React.cloneElement(feature.icon, { size: 18, className: "mb-1" })}
                      <span className="text-xs">{feature.name}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-2">
          <Input 
            value={currentFeature} 
            onChange={(e) => setCurrentFeature(e.target.value)} 
            placeholder="e.g., User Authentication, Data Synchronization" 
            wrapperClassName="flex-grow mb-0"
            onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
          />
          <Button onClick={handleAddFeature} size="sm" variant="outline" className="shadow-md hover:shadow-lg">
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {selections.features.map(feature => (
            <span key={feature} className="bg-[#F26545]/20 text-[#F26545] px-3 py-2 rounded-lg text-sm flex items-center shadow-sm border border-[#F26545]/30">
              <Check size={14} className="mr-2" />
              {feature}
              <button onClick={() => handleRemoveFeature(feature)} className="ml-2 text-[#F26545] hover:text-orange-600 transition-colors">
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <StepNavigation nextDisabled={!selections.appName || selections.pages.length === 0 || selections.features.length === 0} />
    </AnimatedContainer>
  );
};

export default PageFeatureStep;
