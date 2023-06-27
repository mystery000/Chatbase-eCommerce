export type FileData = { path: string; name: string; content: string };

export type Message = {
  type: 'AIMESSAGE' | 'CLIENTMESSAGE';
  message: string;
};
