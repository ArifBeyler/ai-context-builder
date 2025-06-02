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
    name: 'Orange Sunset',
    background: 'bg-[#F5F6F9]', 
    text: 'text-[#292F3B]',   
    primary: 'bg-[#F26545]',    
    secondary: 'text-[#F26545]', 
    previewClasses: {
      bg: 'bg-orange-50',
      text: 'bg-orange-900',
      accent: 'bg-orange-500',
    }
  },
  {
    id: 'dark-default-theme', 
    name: 'Midnight Black',
    background: 'bg-slate-900', 
    text: 'text-slate-100',   
    primary: 'bg-[#F26545]',    
    secondary: 'text-[#F26545]', 
    previewClasses: {
      bg: 'bg-slate-900',
      text: 'bg-slate-100',
      accent: 'bg-orange-500',
    }
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    background: 'bg-blue-50',
    text: 'text-blue-900',
    primary: 'bg-blue-600',
    secondary: 'text-blue-600',
    previewClasses: {
      bg: 'bg-blue-50',
      text: 'bg-blue-900',
      accent: 'bg-blue-600',
    }
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    background: 'bg-green-50',
    text: 'text-green-900',
    primary: 'bg-green-600',
    secondary: 'text-green-600',
    previewClasses: {
      bg: 'bg-green-50',
      text: 'bg-green-900',
      accent: 'bg-green-600',
    }
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    background: 'bg-purple-50',
    text: 'text-purple-900',
    primary: 'bg-purple-600',
    secondary: 'text-purple-600',
    previewClasses: {
      bg: 'bg-purple-50',
      text: 'bg-purple-900',
      accent: 'bg-purple-600',
    }
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    background: 'bg-rose-50',
    text: 'text-rose-900',
    primary: 'bg-rose-500',
    secondary: 'text-rose-500',
    previewClasses: {
      bg: 'bg-rose-50',
      text: 'bg-rose-900',
      accent: 'bg-rose-500',
    }
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    background: 'bg-gray-900',
    text: 'text-cyan-300',
    primary: 'bg-cyan-500',
    secondary: 'text-cyan-500',
    previewClasses: {
      bg: 'bg-gray-900',
      text: 'bg-cyan-300',
      accent: 'bg-cyan-500',
    }
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    background: 'bg-gray-50',
    text: 'text-gray-900',
    primary: 'bg-gray-800',
    secondary: 'text-gray-800',
    previewClasses: {
      bg: 'bg-gray-50',
      text: 'bg-gray-900',
      accent: 'bg-gray-600',
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
  cornerStyle: '' as const,
  iconStyle: '' as const,
  useStroke: false,
  colorPaletteId: COLOR_PALETTES[0].id, 
  font: 'Poppins' as AppFont, // Default font to Poppins
  language: '' as const,
};