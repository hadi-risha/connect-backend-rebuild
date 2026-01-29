export interface IMessageService {
  sendMessage(params: {
    chatRoomId: string;
    senderId: string;
    type?: "text" | "image" | "audio";
    image?: { url: string; key: string };
    audio?: { url: string; key: string };
    content?: string;
    replyTo?: string;
  }): Promise<any>;

  getMessages(chatRoomId: string, userId: string, limit?: number, skip?: number): Promise<any>;

  reactToMessage(messageId: string, userId: string, emoji: string): Promise<any>;

  deleteMessage(messageId: string, userId: string): Promise<void>;
}
