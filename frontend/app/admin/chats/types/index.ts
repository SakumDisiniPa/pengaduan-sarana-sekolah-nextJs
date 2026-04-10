export type User = {
  id: string;
  email: string;
  isAdmin?: boolean;
  name?: string;
  avatar?: string;
};

export type Message = {
  id: string;
  text: string;
  created: string;
  sender: string;
  recipient?: string;
  expand?: {
    sender: User;
    recipient: User;
  };
};

export type GroupedMessages = { [key: string]: Message[] };
