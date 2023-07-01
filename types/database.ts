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
  initial_messages?: string[];
  chatbot_icon?: string;
  profile_icon?: string;
  contact_info: Contact;
};
