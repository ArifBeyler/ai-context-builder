import React from 'react'
import { User } from '@supabase/supabase-js'
import { useAppContext } from '@/contexts/AppContext'
import PromptInputStep from '@/components/steps/PromptInputStep'
import PlatformStep from '@/components/steps/PlatformStep'
import DevToolStep from '@/components/steps/DevToolStep'
import OsStep from '@/components/steps/OsStep'
import AiModelStep from '@/components/steps/AiModelStep'
import PageFeatureStep from '@/components/steps/PageFeatureStep'
import DesignStep from '@/components/steps/DesignStep'
import ColorPaletteStep from '@/components/steps/ColorPaletteStep'
import FontStep from '@/components/steps/FontStep'
import LanguageStep from '@/components/steps/LanguageStep'
import FinalScreen from '@/components/FinalScreen'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import CreditDisplay from '@/components/CreditDisplay'
import ContextGenerationLoading from '@/components/ContextGenerationLoading'
import AnimatedContainer from '@/components/shared/AnimatedContainer'
import { createSupabaseClient } from '@/lib/supabase'

// Define step components and their titles in English
const STEPS = [
  { component: PromptInputStep, title: "Define Your App Idea" },
  { component: PlatformStep, title: "Platform Selection" },
  { component: DevToolStep, title: "Development Tool" },
  { component: OsStep, title: "Operating System (if needed)" },
  { component: AiModelStep, title: "AI Model (if needed)" },
  { component: PageFeatureStep, title: "Pages & Features" },
  { component: DesignStep, title: "Design Choices" },
  { component: ColorPaletteStep, title: "Color Palette" },
  { component: FontStep, title: "Font Selection" },
  { component: LanguageStep, title: "Language Support" },
  { component: FinalScreen, title: "Context Ready!" }
]

interface DashboardProps {
  user: User | null
  credits: number
  onContextCreated: () => Promise<void>
  onPurchaseCredits: () => void
  onRequestLogin?: () => void
  showLoginPrompt?: boolean
  onCloseLoginPrompt?: () => void
  onRefreshCredits?: () => Promise<void>
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  credits, 
  onContextCreated, 
  onPurchaseCredits,
  onRequestLogin,
  showLoginPrompt = false,
  onCloseLoginPrompt,
  onRefreshCredits
}) => {
  const {
    currentStep,
    selections,
    updateSelection,
    updateAISuggestions,
    generatedContext,
    generateContextWithAllSelections,
    hasGeneratedContext,
    showContextGeneration,
    setCurrentStep,
    resetSelections,
    saveStateBeforePayment,
    isLoading,
  } = useAppContext()

  const CurrentStepComponent = STEPS[currentStep]?.component
  const currentTitle = STEPS[currentStep]?.title
  const isInitialPromptStep = currentStep === 0

  console.log('🔍 Dashboard render:', { 
    currentStep, 
    isInitialPromptStep, 
    CurrentStepComponent: CurrentStepComponent?.name,
    showContextGeneration
  });

  // Handle going back to start - reset everything
  const handleBackToStart = () => {
    resetSelections()
    // Clear any sessionStorage flags
    sessionStorage.removeItem('forceStartFlow')
  }

  // Conditional rendering for OS step (example logic)
  const osStepIndex = STEPS.findIndex(step => step.component === OsStep)
  if (currentStep === osStepIndex && selections.devTool !== 'Cursor' && selections.devTool !== 'Windsurf' && selections.devTool !== 'Not Sure') {
     // This logic needs careful placement or a more robust step skipping mechanism
  }

  // Login Prompt Modal
  const LoginPrompt = () => {
    if (!showLoginPrompt || !onRequestLogin || !onCloseLoginPrompt) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Login Required</h3>
          <p className="text-gray-600 mb-6">
            You need to sign in anonymously to use this feature. You'll earn 3 free credits!
          </p>
          <div className="flex gap-3">
            <button
              onClick={onRequestLogin}
              className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            >
              Anonymous Login
            </button>
            <button
              onClick={onCloseLoginPrompt}
              className="flex-1 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show context generation loading screen
  if (showContextGeneration) {
    return <ContextGenerationLoading />
  }

  if (isInitialPromptStep && CurrentStepComponent) {
    // PromptInputStep now handles its own full-page layout
    return (
      <div>
        <CreditDisplay 
          credits={credits} 
          onPurchaseCredits={onPurchaseCredits}
          user={user}
          onRequestLogin={onRequestLogin}
        />
        {CurrentStepComponent === FinalScreen ? (
          <CurrentStepComponent 
            onBack={handleBackToStart}
            credits={credits}
            user={user}
            onRefreshCredits={onRefreshCredits}
            onPurchaseCredits={onPurchaseCredits}
          />
        ) : (
          <CurrentStepComponent onContextCreated={onContextCreated} {...({} as any)} />
        )}
        <LoginPrompt />
      </div>
    )
  }

  const handlePurchaseCredits = () => {
    console.log('💰 Purchase credits requested from Dashboard');
    // Save current state before going to payment
    saveStateBeforePayment();
    onPurchaseCredits();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6F9] text-[#292F3B]">
      <Header />
      <CreditDisplay 
        credits={credits} 
        onPurchaseCredits={onPurchaseCredits}
        user={user}
        onRequestLogin={onRequestLogin}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
            <LoadingSpinner size="xl" color="text-[#F26545]" />
          </div>
        )}
        {/* Main content card with new light theme styling */}
        <AnimatedContainer delay={0}>
          <div className="w-full max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-12 sm:p-16 md:p-24 lg:p-32 transform transition-all duration-500 ease-in-out">
            <AnimatedContainer delay={200}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 md:mb-20 text-[#292F3B]">
                {currentTitle}
              </h2>
            </AnimatedContainer>
            <AnimatedContainer delay={300}>
              {CurrentStepComponent ? (
                CurrentStepComponent === FinalScreen ? (
                  <CurrentStepComponent 
                    onBack={handleBackToStart}
                    credits={credits}
                    user={user}
                    onRefreshCredits={onRefreshCredits}
                    onPurchaseCredits={onPurchaseCredits}
                  />
                ) : CurrentStepComponent === LanguageStep ? (
                  <CurrentStepComponent 
                    user={user}
                    credits={credits}
                    onPurchaseCredits={onPurchaseCredits}
                    onRequestLogin={onRequestLogin}
                    onContextCreated={onContextCreated}
                    onBack={handleBackToStart}
                  />
                ) : (
                  <CurrentStepComponent 
                    onContextCreated={onContextCreated}
                    {...({} as any)}
                  />
                )
              ) : (
                <p>Step not found.</p>
              )}
            </AnimatedContainer>
          </div>
        </AnimatedContainer>
      </main>
      <Footer />
      <LoginPrompt />
    </div>
  )
}

export default Dashboard 
