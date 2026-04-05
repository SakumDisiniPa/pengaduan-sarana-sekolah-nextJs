export interface ProfileUser {
  id: string;
  collectionId: string;
  collectionName: string;
  email: string;
  name?: string;
  avatar?: string;
  mfaEnabled?: boolean;
}

export type MessageType = "success" | "error";

export interface Message {
  text: string;
  type: MessageType;
}
