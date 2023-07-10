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
  visibility: VisibilityType;
  ip_limit: number;
  ip_limit_message: string;
  ip_limit_timeframe: number;
  initial_messages?: JSON;
  chatbot_icon?: string;
  profile_icon?: string;
  contact_info: Contact;
};

export type Source = {
  chatbot_id: string;
  type: SourceType;
  content: string;
  size: number;
};

export type VisibilityType = 'public' | 'protected' | 'private';
export type SourceType = 'file' | 'text' | 'crawl' | 'sitemap';
