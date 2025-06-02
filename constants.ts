import { ColorPalette, AppFont } from './types';

export const APP_FONTS: AppFont[] = ['Poppins', 'Inter', 'SF Pro', 'Roboto', 'Montserrat', 'Lato']; // Poppins added and made first

export const EXAMPLE_PROMPTS: string[] = [
  "A mobile app for tracking personal plant care schedules...",
  "A web platform for freelance writers to find projects...",
  "An AI-powered recipe generator based on available ingredients...",
  "A community forum for local artists to share their work...",
  "A task management tool with team collaboration features...",
  "A fitness app with personalized AI coaching and progress tracking...",
  "A language learning game using voice recognition and interactive stories...",
  "An e-commerce site specializing in handmade crafts...",
  "A booking system for local barbers and salons...",
  "A mindfulness app with guided meditations and mood tracking..."
];

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'primary-light-theme',
    name: 'Primary Light Theme (Default)',
    background: 'bg-[#F5F6F9]', 
    text: 'text-[#292F3B]',   
    primary: 'bg-[#F26545]',    
    secondary: 'text-[#F26545]', 
    previewClasses: {
      bg: 'bg-[#F5F6F9]',
      text: 'text-[#292F3B]',
      accent: 'bg-[#F26545]',
    }
  },
  {
    id: 'dark-default-theme', 
    name: 'Primary Dark Theme',
    background: 'bg-slate-900', 
    text: 'text-slate-100',   
    primary: 'bg-[#F26545]',    
    secondary: 'text-[#F26545]', 
    previewClasses: {
      bg: 'bg-slate-900',
      text: 'text-slate-100',
      accent: 'bg-[#F26545]',
    }
  },
  {
    id: 'cyber-glow-light-bg', 
    name: 'Cyber Glow (Light Background)',
    background: 'bg-gray-100', 
    text: 'text-purple-700', 
    primary: 'bg-gradient-to-r from-pink-500 to-purple-600',
    secondary: 'text-lime-600', 
    previewClasses: {
      bg: 'bg-gray-100',
      text: 'text-purple-700',
      accent: 'bg-pink-500',
    }
  },
  {
    id: 'nature-harmony',
    name: 'Nature Harmony',
    background: 'bg-green-50',
    text: 'text-green-800',
    primary: 'bg-gradient-to-r from-emerald-500 to-lime-600',
    secondary: 'text-amber-600',
    previewClasses: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      accent: 'bg-emerald-500',
    }
  }
];

export const DEFAULT_SELECTIONS = {
  userPrompt: '',
  aiSuggestions: {
    features: [],
    appName: '',
    font: 'Poppins' as AppFont, // Default font to Poppins
    fontReason: '',
  },
  platform: '' as const,
  devTool: '' as const,
  aiAppModel: '' as const,
  appName: '',
  pages: [],
  features: [],
  includeProfilePic: false,
  uiStyle: '' as const,
  iconStyle: '' as const,
  useStroke: false,
  colorPaletteId: COLOR_PALETTES[0].id, 
  font: 'Poppins' as AppFont, // Default font to Poppins
  language: '' as const,
};

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';