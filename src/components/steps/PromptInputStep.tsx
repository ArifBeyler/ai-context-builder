import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Textarea from '../shared/Textarea';
import Button from '../shared/Button';
import AnimatedContainer from '../shared/AnimatedContainer';
import { EXAMPLE_PROMPTS } from '../../constants';
import { ArrowRight, Lightbulb, Sparkles, TerminalSquare } from 'lucide-react';

const AI_TOOLS = ['AI', 'Windsurf', 'Cursor', 'Gemini', 'Claude', 'Bolt', 'Lovable', 'Replit'];

const INSPIRATION_CHIPS = [
  "Track my fitness goals with weekly reminders and AI suggestions",
  "Create a to-do list app with minimal UI and dark mode",
  "Build a simple journal app with OpenAI chat and calendar sync",
  "Design a recipe sharing platform with ingredient tracking",
  "Develop a meditation app with personalized breathing exercises",
  "Make a habit tracker with streak counting and motivational quotes",
  "Create a local event discovery app with social features",
  "Build a plant care reminder app with photo progress tracking",
  "Design a budget tracker with expense categorization and insights"
];

const TypewriterText: React.FC = () => {
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentTool = AI_TOOLS[currentToolIndex];
    
    const typewriterTimeout = setTimeout(() => {
      if (isPaused) {
        // Pause for 2 seconds before starting to delete
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (isDeleting) {
        // Deleting text
        if (displayText.length > 0) {
          setDisplayText(prev => prev.slice(0, -1));
        } else {
          // Finished deleting, move to next tool
          setIsDeleting(false);
          setCurrentToolIndex(prev => (prev + 1) % AI_TOOLS.length);
        }
      } else {
        // Typing text
        if (displayText.length < currentTool.length) {
          setDisplayText(prev => currentTool.slice(0, prev.length + 1));
        } else {
          // Finished typing, pause before deleting
          setIsPaused(true);
        }
      }
    }, isPaused ? 3000 : isDeleting ? 100 : 150); // Pause for 3s, delete faster, type normally

    return () => clearTimeout(typewriterTimeout);
  }, [currentToolIndex, displayText, isDeleting, isPaused]);

  return (
    <span className="text-[#F26545] relative inline-block min-w-[160px] text-left">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const PromptInputStep: React.FC = () => {
  const { submitPrompt, isLoading, selections } = useAppContext();
  const [prompt, setPrompt] = useState(selections.userPrompt || '');
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPlaceholderIndex(prevIndex => (prevIndex + 1) % INSPIRATION_CHIPS.length);
    }, 3000); // Change placeholder every 3 seconds
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = () => {
    if (prompt.trim()) {
      submitPrompt(prompt.trim());
    }
  };

  const handleChipClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F6F9] text-[#292F3B] flex flex-col items-center p-4 sm:p-8 transition-colors duration-300 ease-in-out overflow-y-auto">
      {/* Top Section: Prompt Input Area - Increased top padding significantly */}
      <div className="w-full max-w-3xl lg:max-w-4xl text-center pt-[10.5rem] sm:pt-[11.5rem] md:pt-[12.5rem]">
        {/* Fixed height container for headline to prevent layout shifts */}
        <AnimatedContainer delay={0}>
          <div className="h-20 sm:h-24 md:h-32 mb-4 flex items-center justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <div>Drop Your Idea, <TypewriterText /></div>
              <div>Does the Rest.</div>
            </h1>
          </div>
        </AnimatedContainer>
        
        {/* Fixed height container for subtitle */}
        <AnimatedContainer delay={200}>
          <div className="h-16 sm:h-18 mb-10 flex items-center justify-center">
            <p className="text-base sm:text-lg md:text-xl text-slate-600">
              From concept to code blueprint in seconds, powered by artificial intelligence.
            </p>
          </div>
        </AnimatedContainer>

        <AnimatedContainer delay={400}>
          <div className="relative mb-6">
            <Textarea
              placeholder={`Ask Ai Context Builder: ${INSPIRATION_CHIPS[currentPlaceholderIndex].substring(0,45)}...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={isLoading}
              className="bg-white border-slate-300 placeholder-slate-400 text-[#292F3B] rounded-xl p-4 pr-16 text-lg focus:ring-2 focus:ring-[#F26545] shadow-xl"
              wrapperClassName="mb-0"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              isLoading={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 !p-2.5 bg-[#F26545] hover:bg-[#E05434] rounded-lg shadow-md hover:shadow-lg"
              aria-label="Submit prompt"
            >
              <ArrowRight size={20} className="text-white" />
            </Button>
          </div>
        </AnimatedContainer>
        
        {/* Inspiration Chips */}
        <AnimatedContainer delay={600}>
          <div className="mb-12">
            <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wide">
              ✨ Inspiration Chips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-xl lg:max-w-2xl mx-auto">
              {INSPIRATION_CHIPS.map((chipPrompt, index) => (
                <button
                  key={index}
                  onClick={() => handleChipClick(chipPrompt)}
                  className="bg-white hover:bg-slate-50 text-slate-700 hover:text-[#292F3B] px-4 py-3 rounded-xl text-sm cursor-pointer transition-all duration-200 ease-in-out shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 text-left leading-relaxed h-auto"
                >
                  {chipPrompt}
                </button>
              ))}
            </div>
          </div>
        </AnimatedContainer>
      </div>

      {/* New Informational Section */}
      <AnimatedContainer delay={800}>
        <section className="mt-16 sm:mt-20 md:mt-24 w-full max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#292F3B] mb-12 sm:mb-16">
            Got Brilliant Ideas but No Coding Skills?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedContainer delay={1000}>
              <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col items-center">
                <div className="flex justify-center mb-5">
                  <Lightbulb size={48} className="text-[#F26545]" />
                </div>
                <h3 className="text-xl font-semibold text-[#292F3B] mb-3 text-center">Step-by-Step: Idea to Project</h3>
                <p className="text-slate-600 text-sm text-center">
                  Ai Context Builder helps you transform your bright ideas into clear, structured project plans without getting bogged down in technical details.
                </p>
              </div>
            </AnimatedContainer>
            <AnimatedContainer delay={1150}>
              <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col items-center">
                <div className="flex justify-center mb-5">
                  <Sparkles size={48} className="text-[#F26545]" />
                </div>
                <h3 className="text-xl font-semibold text-[#292F3B] mb-3 text-center">AI-Powered Suggestions</h3>
                <p className="text-slate-600 text-sm text-center">
                  Get smart recommendations from Gemini AI at every stage of your project, from app name and features to font selection and color palettes.
                </p>
              </div>
            </AnimatedContainer>
            <AnimatedContainer delay={1300}>
              <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col items-center">
                <div className="flex justify-center mb-5">
                  <TerminalSquare size={48} className="text-[#F26545]" />
                </div>
                <h3 className="text-xl font-semibold text-[#292F3B] mb-3 text-center">Easy Integration</h3>
                <p className="text-slate-600 text-sm text-center">
                  Easily export the generated <code className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-md text-xs font-mono shadow-sm">context.md</code> file to development tools like Windsurf.ai and start coding with AI assistance right away.
                </p>
              </div>
            </AnimatedContainer>
          </div>
        </section>
      </AnimatedContainer>

      <AnimatedContainer delay={1200}>
        <p className="text-xs text-slate-500 mt-16 mb-8">
          Powered by Gemini AI & Ai Context Builder
        </p>
      </AnimatedContainer>
    </div>
  );
};

export default PromptInputStep;
