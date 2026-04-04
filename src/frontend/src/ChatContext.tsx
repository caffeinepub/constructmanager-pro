import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { toast } from "sonner";
import type { ChatMessage } from "./ProjectDataContext";
import {
  canisterGetDMChat,
  canisterGetGroupChat,
  canisterPostChat,
} from "./canister";

// Re-export so existing imports work
export type { ChatMessage } from "./ProjectDataContext";

interface ChatContextType {
  groupMessages: Record<string, ChatMessage[]>;
  dmMessages: Record<string, ChatMessage[]>;
  isLoadingChat: boolean;
  addGroupMessage: (
    projectId: string,
    msg: Omit<ChatMessage, "id">,
  ) => Promise<void>;
  // Legacy-compatible: key is "projectId:email1:email2"; receiverEmail is optional
  addDMMessage: (
    key: string,
    msg: Omit<ChatMessage, "id">,
    receiverEmail?: string,
  ) => Promise<void>;
  addReaction: (projectId: string, msgId: string, emoji: string) => void;
  loadGroupMessages: (projectId: string) => Promise<void>;
  loadDMMessages: (
    projectId: string,
    email1: string,
    email2: string,
  ) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

function mapCanisterMessages(
  msgs: Awaited<ReturnType<typeof canisterGetGroupChat>>,
): ChatMessage[] {
  return msgs.map((m) => ({
    id: String(Number(m.id)),
    senderId: m.senderEmail,
    senderName: m.senderName,
    senderRole: m.senderRole,
    text: m.text,
    timestamp: m.timestamp,
    reactions: [],
  }));
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [groupMessages, setGroupMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [dmMessages, setDMMessages] = useState<Record<string, ChatMessage[]>>(
    {},
  );
  const [isLoadingChat] = useState(false);

  const loadGroupMessages = useCallback(async (projectId: string) => {
    try {
      const msgs = await canisterGetGroupChat(Number(projectId));
      setGroupMessages((prev) => ({
        ...prev,
        [projectId]: mapCanisterMessages(msgs),
      }));
    } catch (err) {
      console.error("Failed to load group messages:", err);
    }
  }, []);

  const loadDMMessages = useCallback(
    async (projectId: string, email1: string, email2: string) => {
      try {
        const msgs = await canisterGetDMChat(Number(projectId), email1, email2);
        const key = `${projectId}:${email1}:${email2}`;
        const keyAlt = `${projectId}:${email2}:${email1}`;
        const mapped = mapCanisterMessages(msgs);
        setDMMessages((prev) => ({
          ...prev,
          [key]: mapped,
          [keyAlt]: mapped,
        }));
      } catch (err) {
        console.error("Failed to load DM messages:", err);
      }
    },
    [],
  );

  const addGroupMessage = useCallback(
    async (projectId: string, msg: Omit<ChatMessage, "id">) => {
      // Optimistic update
      const optimisticMsg: ChatMessage = {
        ...msg,
        id: `opt_${Date.now()}`,
        reactions: [],
      };
      setGroupMessages((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] ?? []), optimisticMsg],
      }));

      try {
        await canisterPostChat(
          Number(projectId),
          msg.senderId,
          msg.senderName,
          msg.senderRole,
          msg.text,
          false,
          "",
        );
        // Refresh from canister
        await loadGroupMessages(projectId);
      } catch {
        toast.error("Failed to send message");
        // Rollback optimistic update
        setGroupMessages((prev) => ({
          ...prev,
          [projectId]: (prev[projectId] ?? []).filter(
            (m) => m.id !== optimisticMsg.id,
          ),
        }));
      }
    },
    [loadGroupMessages],
  );

  const addDMMessage = useCallback(
    async (
      key: string,
      msg: Omit<ChatMessage, "id">,
      receiverEmail?: string,
    ) => {
      // Optimistic update
      const optimisticMsg: ChatMessage = {
        ...msg,
        id: `opt_${Date.now()}`,
        reactions: [],
      };
      setDMMessages((prev) => ({
        ...prev,
        [key]: [...(prev[key] ?? []), optimisticMsg],
      }));

      // Parse projectId and emails from key (format: "projectId:email1:email2")
      const parts = key.split(":");
      const projectId = parts[0] ?? "";
      const email1 = parts[1] ?? msg.senderId;
      const targetEmail = receiverEmail ?? parts[2] ?? "";

      try {
        await canisterPostChat(
          Number(projectId),
          msg.senderId,
          msg.senderName,
          msg.senderRole,
          msg.text,
          true,
          targetEmail,
        );
        // Refresh from canister
        await loadDMMessages(projectId, email1, targetEmail);
      } catch {
        toast.error("Failed to send message");
        setDMMessages((prev) => ({
          ...prev,
          [key]: (prev[key] ?? []).filter((m) => m.id !== optimisticMsg.id),
        }));
      }
    },
    [loadDMMessages],
  );

  const addReaction = useCallback(
    (projectId: string, msgId: string, emoji: string) => {
      setGroupMessages((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] ?? []).map((m) =>
          m.id === msgId ? { ...m, reactions: [...m.reactions, emoji] } : m,
        ),
      }));
    },
    [],
  );

  return (
    <ChatContext.Provider
      value={{
        groupMessages,
        dmMessages,
        isLoadingChat,
        addGroupMessage,
        addDMMessage,
        addReaction,
        loadGroupMessages,
        loadDMMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
