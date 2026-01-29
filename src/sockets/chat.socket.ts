import { Server, Socket } from "socket.io";
import { ChatService } from "../services/ChatService";
import { MessageService } from "../services/MessageService";
import { IMessageReaction } from "../models/Message.model";
import { Types } from "mongoose";

const chatService = new ChatService();
const messageService = new MessageService();

// Keep track of online users (userId -> socketId)
const onlineUsers = new Map<string, string>();

export const chatSocket = (io: Server, socket: Socket) => {
  const userId = socket.data.user.id;

  onlineUsers.set(userId, socket.id);
  io.emit("user:online", { userId });

  socket.on("chat:join", async ({ chatRoomId }) => {
    await chatService.validateMembership(chatRoomId, userId);
    socket.join(chatRoomId);
  });

  socket.on("chat:leave", ({ chatRoomId }) => {
    socket.leave(chatRoomId);
  });

  socket.on("message:send", async (payload) => {
    await chatService.validateMembership(payload.chatRoomId, userId);

    const message = await messageService.sendMessage({
      chatRoomId: payload.chatRoomId,
      senderId: userId,
      type: payload.type,  
      content: payload?.content,
      image: payload?.image,
      audio: payload?.audio,
      replyTo: payload?.replyTo,
    });

    io.to(payload.chatRoomId).emit("message:new", message);
  });

  socket.on("typing:start", ({ chatRoomId }) => {
    socket.to(chatRoomId).emit("typing:start", { userId });
  });

  socket.on("typing:stop", ({ chatRoomId }) => {
    socket.to(chatRoomId).emit("typing:stop", { userId });
  });

  socket.on("message:read", async ({ chatRoomId, messageId }) => {
    await chatService.markChatRead(chatRoomId, userId, messageId);

    socket.to(chatRoomId).emit("message:read", {
      chatRoomId,
      userId,
      messageId,
    });
  });

  socket.on("message:react", async ({ chatRoomId, messageId, emoji }: {
    chatRoomId: string;
    messageId: string;
    emoji: string;
  }) => {
    await chatService.validateMembership(chatRoomId, userId);

    const message = await messageService.reactToMessage(
      messageId,
      userId,
      emoji
    );

    if (!message) return;

    io.to(chatRoomId).emit("message:reaction", {
      messageId: message._id.toString(),
      reactions: message.reactions.map(
        (r: IMessageReaction) => ({
          emoji: r.emoji,
          users: r.users.map((u: Types.ObjectId) =>
            u.toString()
          ),
        })
      ),
    });
  });

  socket.on("message:delete", async ({ chatRoomId, messageId }) => {
    await chatService.validateMembership(chatRoomId, userId);
    await messageService.deleteMessage(messageId, userId);

    io.to(chatRoomId).emit("message:deleted", { messageId });
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(userId);
    io.emit("user:offline", { userId });
  });
};

