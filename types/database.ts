export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Contact = {
  title: string;
  name: { active: boolean; label: string };
  email: { active: boolean; label: string };
  phone: { active: boolean; label: string };
};

export type Chatbot = {
  chatbot_id: string;
  name: string;
  created_at: Date;
  promptTemplate: string;
  model: string;
  temperature: number;
  visibility: string;
  ip_limit: number;
  ip_limit_message: string;
  ip_limit_timeframe: number;
  chatbot_icon: string;
  profile_icon: string;
  active_profile_icon: boolean;
  contact: Contact;
  initial_messages?: string;
};

export type SourceType = 'FILE' | 'TEXT' | 'WEBSITE' | 'SITEMAP';

export type Source = {
  chatbot_id: string;
  source_id: string;
  name: string;
  type: SourceType;
  content: string;
  characters: number;
  vectors: number;
};
