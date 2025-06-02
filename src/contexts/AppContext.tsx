'use client'

import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import { AppSelections, AppContextType, AISuggestions, Platform, MobileOS, DevTool, OperatingSystem, AiAppModel, DesignStyle, CornerStyle, IconStyle, AppFont, AppLanguage } from '../types';
import { DEFAULT_SELECTIONS, APP_FONTS } from '../constants';
import OpenAI from 'openai';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  credits?: number;
  onRefreshCredits?: () => Promise<void>;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, credits: externalCredits = 0, onRefreshCredits }) => {
  const [selections, setSelections] = useState<AppSelections>(DEFAULT_SELECTIONS);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedContext, setGeneratedContext] = useState<string>('');
  const [showContextGeneration, setShowContextGeneration] = useState<boolean>(false);
  const [autoStartGeneration, setAutoStartGeneration] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(externalCredits);
  const [hasGeneratedContext, setHasGeneratedContext] = useState<boolean>(false);

  // Debug logging for currentStep changes
  useEffect(() => {
    console.log('🔢 currentStep changed to:', currentStep);
  }, [currentStep]);

  // Sync external credits with internal state
  useEffect(() => {
    console.log('💰 Credits sync:', { externalCredits, previousCredits: credits });
    setCredits(externalCredits);
  }, [externalCredits]);

  const updateSelection = useCallback(<K extends keyof AppSelections>(key: K, value: AppSelections[K]) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateAISuggestions = useCallback((suggestions: Partial<AISuggestions>) => {
    setSelections(prev => ({
      ...prev,
      aiSuggestions: {
        ...prev.aiSuggestions,
        ...suggestions,
      }
    }));
  }, []);

  const resetSelections = useCallback(() => {
    setSelections(DEFAULT_SELECTIONS);
    setCurrentStep(0);
    setGeneratedContext('');
    setShowContextGeneration(false);
    setAutoStartGeneration(false);
    setHasGeneratedContext(false);
  }, []);

  const saveStateBeforePayment = useCallback(() => {
    const stepState = {
      step: currentStep,
      selections: selections,
      hasGeneratedContext: hasGeneratedContext,
      timestamp: Date.now()
    }
    sessionStorage.setItem('prePaymentState', JSON.stringify(stepState))
    console.log('💾 State saved before payment:', stepState)
  }, [currentStep, selections, hasGeneratedContext]);

  const submitPrompt = async (prompt: string) => {
    console.log('📝 submitPrompt called:', prompt);
    setIsLoading(true);
    updateSelection('userPrompt', prompt);
    
    try {
      // Just save the prompt and proceed to step 1 (Platform selection)
      // We'll generate context at the end after all steps are completed
      console.log('🔄 Setting currentStep to 1 (Platform Selection)');
      setCurrentStep(1);
      console.log('✅ Step changed to:', 1);
    } catch (error) {
      console.error("Error saving prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContextFile = useCallback(() => {
    // AI has already generated the context content during submitPrompt
    // This function is called when user reaches the final step
    // The context content is already set by AI, so we don't need to rebuild it here
    if (!generatedContext) {
      // Fallback if somehow context wasn't generated
      const {
        userPrompt, aiSuggestions, platform, mobileOS, responsiveDesign,
        devTool, operatingSystem, aiAppModel,
        appName: finalAppName, pages, features, includeProfilePic, uiStyle,
        cornerStyle, iconStyle, useStroke, colorPaletteId, font, language
      } = selections;

      const chosenAppName = finalAppName || aiSuggestions.appName || "My Application";

      let context = `# ${chosenAppName} - context.md\n\n`;
      context += `## 0. User Prompt / Idea\n${userPrompt}\n\n`;
      context += `## 1. Platform Selection\n- Platform: ${platform || 'Not specified'}\n`;
      if (platform === 'Mobile' && mobileOS) context += `- Mobile OS: ${mobileOS}\n`;
      if (platform === 'Web') context += `- Responsive Design: ${responsiveDesign ? 'Yes' : 'No'}\n`;
      context += `\n## Status\nBasic fallback context generated. AI context generation was not completed.`;

      setGeneratedContext(context);
    }
  }, [selections, generatedContext]);

  const generateContextWithAllSelections = useCallback(async (onContextCreated?: () => Promise<void>) => {
    setIsLoading(true);
    setShowContextGeneration(true); // Show context generation loading screen
    
    // Call onContextCreated first to deduct credit before AI generation
    if (onContextCreated) {
      try {
        await onContextCreated();
      } catch (error) {
        console.error('Error in onContextCreated:', error);
        setIsLoading(false);
        setShowContextGeneration(false);
        return;
      }
    }
    
    try {
      // Initialize OpenAI with API key from environment
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found');
      }
      
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      // Build comprehensive prompt including all user selections
      const {
        userPrompt, platform, mobileOS, responsiveDesign, devTool, operatingSystem,
        aiAppModel, appName, pages, features, includeProfilePic, uiStyle,
        cornerStyle, iconStyle, useStroke, colorPaletteId, font, language
      } = selections;

      const detailedPrompt = `
User's App Idea: "${userPrompt}"

User's Technical Preferences:
- Platform: ${platform}${platform === 'Mobile' ? ` (${mobileOS})` : ''}${platform === 'Web' ? ` (Responsive: ${responsiveDesign ? 'Yes' : 'No'})` : ''}
- Development Tool: ${devTool}
- Operating System: ${operatingSystem || 'Not specified'}
- AI Model: ${aiAppModel}
- App Name: ${appName}
- Pages: ${pages.join(', ')}
- Features: ${features.join(', ')}
- Include Profile Picture: ${includeProfilePic ? 'Yes' : 'No'}
- UI Style: ${uiStyle}
- Corner Style: ${cornerStyle}
- Icon Style: ${iconStyle}
- Use Stroke Icons: ${useStroke ? 'Yes' : 'No'}
- Font: ${font}
- Language: ${language}

Please generate a comprehensive context.md file that takes into account both the user's app idea and all their technical preferences listed above.
`;
      
      const systemInstruction = `You are an expert technical consultant. Based on the user's app idea and their detailed technical selections, generate a complete context.md file.
      Respond ONLY with a valid JSON object. Do not include any explanatory text before or after the JSON.
      The JSON object should have the following keys:
      - "contextContent": A complete markdown content for context.md file that includes all relevant technical details based on the user's app idea and their technical preferences
      - "suggestedFeaturesString": A comma-separated string of 3-5 relevant technical features (e.g., "User Authentication,Push Notifications,Offline Storage")
      - "suggestedFont": A font name from these options: ${APP_FONTS.join(", ")}
      - "fontReason": Brief explanation for the font choice
      
      The contextContent should be a professional markdown document that includes:
      - App overview and purpose
      - Technical requirements based on user selections
      - Recommended architecture for their chosen platform and tools
      - Key features and implementations
      - Development considerations
      - Best practices and recommendations
      - Integration with their selected tools and frameworks
      
      Make sure to incorporate ALL the user's technical preferences into the context file.
      
      Example JSON:
      {
        "contextContent": "# MyApp - context.md\n\n## App Overview\n...",
        "suggestedFeaturesString": "User Authentication,Real-time Chat,Cloud Storage",
        "suggestedFont": "Poppins",
        "fontReason": "Modern and readable for UI applications"
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemInstruction
          },
          {
            role: "user",
            content: detailedPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      console.log('🤖 OpenAI API response received:', {
        status: 'success',
        usage: response.usage,
        messageLength: response.choices[0]?.message?.content?.length || 0
      });

      const responseText = response.choices[0]?.message?.content;
      console.log('📝 Raw OpenAI response:', responseText);

      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
        console.log('✅ Successfully parsed OpenAI JSON response:', {
          hasContextContent: !!parsedData.contextContent,
          contextLength: parsedData.contextContent?.length || 0,
          hasSuggestedFeatures: !!parsedData.suggestedFeaturesString,
          hasSuggestedFont: !!parsedData.suggestedFont
        });
      } catch (parseError) {
        console.error('❌ Failed to parse OpenAI JSON response:', parseError);
        console.log('🔍 Raw response text:', responseText);
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      // Set the AI-generated context content
      if (parsedData.contextContent && parsedData.contextContent.trim()) {
        console.log('✅ Setting generated context content:', parsedData.contextContent.substring(0, 200) + '...');
        setGeneratedContext(parsedData.contextContent);
        setHasGeneratedContext(true);
      } else {
        console.warn('⚠️ No valid context content in OpenAI response, using fallback');
        throw new Error('No valid context content received from OpenAI');
      }

      // Hide context generation loading and show cursor rules offer
      setShowContextGeneration(false);
      setCurrentStep(10); // Go directly to final screen step
      console.log('⚡ Payment flow: Skipping cursor rules, going directly to FinalScreen');
    } catch (error) {
      console.error("Error calling OpenAI API or parsing JSON:", error);
      
      // Set fallback context content with user's selections
      const fallbackContext = `# ${selections.appName || 'My App'} - context.md

## App Overview
Context generation failed. Please try again.

## User Idea
${selections.userPrompt}

## User Technical Preferences
- Platform: ${selections.platform}
- Development Tool: ${selections.devTool}
- UI Style: ${selections.uiStyle}
- Font: ${selections.font}
- Language: ${selections.language}

## Status
AI context generation encountered an error. A basic fallback context has been provided with your selections.`;
      
      setGeneratedContext(fallbackContext);
      setHasGeneratedContext(true);
      
      // Hide context generation loading and show cursor rules offer even on error
      setShowContextGeneration(false);
      setCurrentStep(10); // Go directly to final screen step
      console.log('⚡ Payment flow: Skipping cursor rules, going directly to FinalScreen');
    } finally {
      setIsLoading(false);
    }
  }, [selections]);

  // Check for auto-start flow after payment
  useEffect(() => {
    console.log('🔍 Checking forceStartFlow...', {
      forceStartFlow: sessionStorage.getItem('forceStartFlow'),
      externalCredits,
      hasGeneratedContext,
      showContextGeneration,
      currentStep,
      selectionsUserPrompt: selections.userPrompt
    });
    
    const forceStartFlow = sessionStorage.getItem('forceStartFlow');
    if (forceStartFlow === 'true' && !hasGeneratedContext && !showContextGeneration) {
      console.log('🔄 Auto-starting context generation flow after payment...');
      console.log('💳 Bypassing credits check due to payment success flag');
      sessionStorage.removeItem('forceStartFlow');
      
      // ONLY restore if there's a pre-payment state (user was in middle of flow)
      const prePaymentStateStr = sessionStorage.getItem('prePaymentState');
      if (prePaymentStateStr) {
        try {
          const prePaymentState = JSON.parse(prePaymentStateStr);
          console.log('🔄 Restoring pre-payment state:', prePaymentState);
          
          // Restore selections if they exist
          if (prePaymentState.selections) {
            setSelections(prePaymentState.selections);
          }
          
          // If user was at final step (step 10), directly generate context
          if (prePaymentState.step === 10) {
            console.log('🎯 User was at final step, generating context...');
            setTimeout(() => {
              generateContextWithAllSelections();
            }, 1000);
            sessionStorage.removeItem('prePaymentState');
            return;
          }
          
          // If user had completed all steps (step 9), go to final step
          if (prePaymentState.step === 9) {
            console.log('🎯 User completed all steps, going to final step...');
            setCurrentStep(10);
            sessionStorage.removeItem('prePaymentState');
            return;
          }
          
          // If user was in middle of steps, restore their position
          if (prePaymentState.step > 0) {
            console.log(`🎯 Restoring user to step ${prePaymentState.step}`);
            setCurrentStep(prePaymentState.step);
            sessionStorage.removeItem('prePaymentState');
            return;
          }
          
          sessionStorage.removeItem('prePaymentState');
        } catch (error) {
          console.error('❌ Error restoring pre-payment state:', error);
          sessionStorage.removeItem('prePaymentState');
        }
      } else {
        // No pre-payment state = user wasn't in middle of flow
        // Just clear the flag and let them start normally
        console.log('✅ Payment successful but no pre-payment state found.');
        console.log('🏠 User can start a new project normally with added credits.');
        return;
      }
    }
  }, [externalCredits, hasGeneratedContext, showContextGeneration, selections, generateContextWithAllSelections]);

  // Check for auto start context generation after payment
  useEffect(() => {
    const autoStart = localStorage.getItem('autoStartContextGeneration');
    if (autoStart === 'true') {
      localStorage.removeItem('autoStartContextGeneration');
      
      // Try to restore user selections if available
      const pendingGeneration = localStorage.getItem('pendingContextGeneration');
      if (pendingGeneration) {
        try {
          const pendingData = JSON.parse(pendingGeneration);
          if (pendingData.selections) {
            setSelections(prevSelections => ({ ...prevSelections, ...pendingData.selections }));
          }
          localStorage.removeItem('pendingContextGeneration');
        } catch (error) {
          console.error('Error restoring selections:', error);
          localStorage.removeItem('pendingContextGeneration');
        }
      }
      
      // Set current step to LanguageStep (step 9) and trigger generation
      setCurrentStep(9);
      // Add a small delay to ensure state updates are complete
      setTimeout(() => {
        setAutoStartGeneration(true);
      }, 100);
    }
    
    // Check for forced step flow start after payment
    const forceStart = localStorage.getItem('forceStartFlow');
    if (forceStart === 'true') {
      console.log('🚀 Forcing step flow to start after payment...');
      localStorage.removeItem('forceStartFlow');
      
      // Set a default prompt and start the flow
      updateSelection('userPrompt', 'Create an amazing app'); // Default prompt
      setCurrentStep(1); // Start with platform selection
      
      setTimeout(() => {
        console.log('✅ Step flow started, user can now proceed with selections');
      }, 500);
    }
  }, []);

  useEffect(() => {
    if (autoStartGeneration) {
      generateContextWithAllSelections();
      setAutoStartGeneration(false);
    }
  }, [autoStartGeneration, generateContextWithAllSelections]);

  return (
    <AppContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        selections,
        updateSelection,
        updateAISuggestions,
        resetSelections,
        submitPrompt,
        generatedContext,
        setGeneratedContext,
        showContextGeneration,
        setShowContextGeneration,
        autoStartGeneration,
        generateContextFile,
        generateContextWithAllSelections,
        hasGeneratedContext,
        saveStateBeforePayment,
        isLoading,
        setIsLoading,
        credits,
        onRefreshCredits,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
