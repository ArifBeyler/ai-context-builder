import React from 'react';
import { FileText, Sparkles, Zap, Code } from 'lucide-react';

const ContextGenerationLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F9] text-[#292F3B]">
      <div className="text-center space-y-8 max-w-md mx-auto p-8">
        {/* Animated Icon */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 animate-spin">
              <FileText size={80} className="text-[#F26545] opacity-20" />
            </div>
            <div className="absolute inset-0 animate-pulse">
              <FileText size={80} className="text-[#F26545]" />
            </div>
            {/* Floating icons */}
            <div className="absolute -top-2 -right-2 animate-bounce delay-100">
              <Sparkles size={16} className="text-yellow-500" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-bounce delay-300">
              <Zap size={16} className="text-blue-500" />
            </div>
            <div className="absolute -top-2 -left-2 animate-bounce delay-500">
              <Code size={16} className="text-green-500" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-[#292F3B]">
            Creating Your Context File
          </h2>
          <p className="text-lg text-slate-600">
            AI is analyzing your project and generating a comprehensive context file...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 text-left bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-700">Analyzing project requirements</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-300"></div>
            <span className="text-sm text-slate-700">Generating technical specifications</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-500"></div>
            <span className="text-sm text-slate-700">Creating context documentation</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-[#F26545] rounded-full animate-pulse delay-700"></div>
            <span className="text-sm text-slate-700">Finalizing recommendations</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          This usually takes 10-30 seconds depending on project complexity
        </p>
      </div>
    </div>
  );
};

export default ContextGenerationLoading; 