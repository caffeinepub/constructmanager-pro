import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthContext";
import { roleToLabel } from "../AuthContext";
import { useChat } from "../ChatContext";

const QUICK_EMOJIS = ["😊", "👍", "🔥", "✅", "⚠️", "📦", "🏗️", "💬"];

function formatTime(ts: string) {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

const ROLE_COLORS: Record<string, string> = {
  "Chief Engineer": "#f97316",
  "Site Engineer": "#0ea5e9",
  "Materials Engineer": "#10b981",
  "Site Owner": "#8b5cf6",
};

interface GroupChatProps {
  open: boolean;
  onClose: () => void;
}

export default function GroupChat({ open, onClose }: GroupChatProps) {
  const { user, activeProject } = useAuth();
  const { groupMessages, dmMessages, addGroupMessage, addDMMessage } =
    useChat();
  const [tab, setTab] = useState<"group" | "dm">("group");
  const [dmTarget, setDMTarget] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const projectId = activeProject?.id ?? "";
  const members = activeProject?.members ?? [];

  const groupMsgs = groupMessages[projectId] ?? [];

  function getDMKey(targetEmail: string) {
    const emails = [user?.email ?? "", targetEmail].sort();
    return `${projectId}:${emails[0]}:${emails[1]}`;
  }

  const dmMsgs = dmTarget ? (dmMessages[getDMKey(dmTarget)] ?? []) : [];
  const messages = tab === "group" ? groupMsgs : dmMsgs;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!text.trim() || !user) return;
    const msg = {
      senderId: user.email,
      senderName: user.name,
      senderRole: roleToLabel(user.role),
      text: text.trim(),
      timestamp: new Date().toISOString(),
      reactions: [] as string[],
    };
    if (tab === "group") {
      addGroupMessage(projectId, msg);
    } else if (dmTarget) {
      addDMMessage(getDMKey(dmTarget), msg);
    }
    setText("");
    setShowEmoji(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b border-gray-200 bg-white">
          <SheetTitle className="text-[#1a1a1a] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#f97316]" />
            {activeProject?.name ?? "Project"} Chat
          </SheetTitle>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setTab("group");
              setDMTarget(null);
            }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === "group"
                ? "text-[#f97316] border-b-2 border-[#f97316] bg-orange-50"
                : "text-slate-500 hover:text-slate-700"
            }`}
            data-ocid="chat.group_tab"
          >
            💬 Group Chat
          </button>
          <button
            type="button"
            onClick={() => setTab("dm")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === "dm"
                ? "text-[#f97316] border-b-2 border-[#f97316] bg-orange-50"
                : "text-slate-500 hover:text-slate-700"
            }`}
            data-ocid="chat.dm_tab"
          >
            📨 Direct Messages
          </button>
        </div>

        {tab === "dm" && !dmTarget && (
          <div className="flex-1 overflow-y-auto">
            <p className="text-xs text-slate-400 px-4 py-2">
              Select a member to start a conversation
            </p>
            {members
              .filter((m) => m.email !== user?.email)
              .map((m) => (
                <button
                  key={m.email}
                  type="button"
                  onClick={() => setDMTarget(m.email)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100 text-left"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{
                      backgroundColor:
                        ROLE_COLORS[roleToLabel(m.role)] ?? "#64748b",
                    }}
                  >
                    {m.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {m.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {roleToLabel(m.role)}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        )}

        {tab === "dm" && dmTarget && (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setDMTarget(null)}
              className="p-1 rounded hover:bg-slate-200"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <span className="text-sm font-medium text-slate-700">
              {members.find((m) => m.email === dmTarget)?.name ?? dmTarget}
            </span>
          </div>
        )}

        {(tab === "group" || (tab === "dm" && dmTarget)) && (
          <>
            <ScrollArea className="flex-1 px-4 py-3">
              {messages.length === 0 && (
                <div className="text-center py-12" data-ocid="chat.empty_state">
                  <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.email;
                const roleColor = ROLE_COLORS[msg.senderRole] ?? "#64748b";
                return (
                  <div
                    key={msg.id}
                    className={`mb-3 flex gap-2 ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: roleColor }}
                    >
                      {msg.senderName[0]}
                    </div>
                    <div
                      className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}
                    >
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-semibold text-slate-700">
                            {msg.senderName}
                          </span>
                          <Badge
                            className="text-[9px] py-0 px-1.5"
                            style={{
                              backgroundColor: `${roleColor}20`,
                              color: roleColor,
                            }}
                          >
                            {msg.senderRole}
                          </Badge>
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-3 py-2 text-sm ${
                          isMe
                            ? "bg-[#f97316] text-white rounded-tr-sm"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-slate-400">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.reactions.length > 0 && (
                          <span className="text-[11px] bg-slate-100 rounded-full px-1.5 py-0.5">
                            {msg.reactions.slice(-3).join(" ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </ScrollArea>

            {/* Emoji bar */}
            {showEmoji && (
              <div className="flex gap-1.5 px-4 py-2 border-t border-slate-100 bg-slate-50">
                {QUICK_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setText((prev) => prev + e)}
                    className="text-lg hover:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-200 bg-white flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="text-xl hover:scale-110 transition-transform"
                title="Emoji"
              >
                😊
              </button>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  tab === "group"
                    ? "Message the team... (@mention)"
                    : "Send a message..."
                }
                className="flex-1 text-sm"
                data-ocid="chat.input"
              />
              <Button
                size="sm"
                className="bg-[#f97316] hover:bg-[#ea6c10] text-white px-3"
                onClick={handleSend}
                data-ocid="chat.send_button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
