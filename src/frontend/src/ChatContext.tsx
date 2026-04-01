import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { ChatMessage } from "./ProjectDataContext";

interface ChatContextType {
  groupMessages: Record<string, ChatMessage[]>;
  dmMessages: Record<string, ChatMessage[]>;
  addGroupMessage: (projectId: string, msg: Omit<ChatMessage, "id">) => void;
  addDMMessage: (key: string, msg: Omit<ChatMessage, "id">) => void;
  addReaction: (projectId: string, msgId: string, emoji: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}

function demoTime(hoursAgo: number) {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

const DEMO_GROUP_MSGS: Record<string, ChatMessage[]> = {
  alpha: [
    {
      id: "gm1",
      senderId: "ce@demo.com",
      senderName: "Arjun Ramesh",
      senderRole: "Chief Engineer",
      text: "Team, foundation work looks great! Let's target 2nd floor slab by end of week.",
      timestamp: demoTime(8),
      reactions: ["👍", "🔥"],
    },
    {
      id: "gm2",
      senderId: "se@demo.com",
      senderName: "Priya Nair",
      senderRole: "Site Engineer",
      text: "Understood. Rajesh and team are already prepping formwork for the 2nd floor columns.",
      timestamp: demoTime(6),
      reactions: ["✅"],
    },
    {
      id: "gm3",
      senderId: "me@demo.com",
      senderName: "Dinesh Babu",
      senderRole: "Materials Engineer",
      text: "📦 Heads up: Cement stock is at 200 bags. I'll initiate a GRN for 500 more bags from UltraTech today.",
      timestamp: demoTime(3),
      reactions: ["👍"],
    },
  ],
  beta: [
    {
      id: "gm4",
      senderId: "ce@demo.com",
      senderName: "Arjun Ramesh",
      senderRole: "Chief Engineer",
      text: "Site Beta piling is complete. Well done everyone! Next: column casting starts Monday.",
      timestamp: demoTime(5),
      reactions: ["🔥", "✅"],
    },
    {
      id: "gm5",
      senderId: "se@demo.com",
      senderName: "Priya Nair",
      senderRole: "Site Engineer",
      text: "Noted. Will schedule the crew for Monday. Any material requirements I should flag?",
      timestamp: demoTime(4),
      reactions: [],
    },
  ],
  tower: [
    {
      id: "gm6",
      senderId: "ce@demo.com",
      senderName: "Arjun Ramesh",
      senderRole: "Chief Engineer",
      text: "Tower C is on hold pending approval. I'll update everyone once we get clearance from the authority.",
      timestamp: demoTime(12),
      reactions: ["⚠️"],
    },
  ],
};

const DEMO_DM_MSGS: Record<string, ChatMessage[]> = {
  "alpha:ce@demo.com:se@demo.com": [
    {
      id: "dm1",
      senderId: "ce@demo.com",
      senderName: "Arjun Ramesh",
      senderRole: "Chief Engineer",
      text: "Priya, can you double-check the attendance for last week? Need it for payroll approval.",
      timestamp: demoTime(24),
      reactions: [],
    },
    {
      id: "dm2",
      senderId: "se@demo.com",
      senderName: "Priya Nair",
      senderRole: "Site Engineer",
      text: "Done! I've submitted the payroll. Please review when free.",
      timestamp: demoTime(23),
      reactions: ["👍"],
    },
  ],
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const [groupMessages, setGroupMessages] =
    useState<Record<string, ChatMessage[]>>(DEMO_GROUP_MSGS);
  const [dmMessages, setDMMessages] =
    useState<Record<string, ChatMessage[]>>(DEMO_DM_MSGS);

  const addGroupMessage = useCallback(
    (projectId: string, msg: Omit<ChatMessage, "id">) => {
      setGroupMessages((prev) => ({
        ...prev,
        [projectId]: [
          ...(prev[projectId] ?? []),
          { ...msg, id: Date.now().toString() },
        ],
      }));
    },
    [],
  );

  const addDMMessage = useCallback(
    (key: string, msg: Omit<ChatMessage, "id">) => {
      setDMMessages((prev) => ({
        ...prev,
        [key]: [...(prev[key] ?? []), { ...msg, id: Date.now().toString() }],
      }));
    },
    [],
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
        addGroupMessage,
        addDMMessage,
        addReaction,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
