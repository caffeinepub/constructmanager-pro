import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSpreadsheet, MessageSquare, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { roleToLabel, useAuth } from "../AuthContext";
import { useChat } from "../ChatContext";
import { exportChatCSV } from "../utils/csvExport";

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

export default function InlineChatPanel() {
  const { user, activeProject } = useAuth();
  const {
    groupMessages,
    dmMessages,
    addGroupMessage,
    addDMMessage,
    addReaction,
    loadGroupMessages,
  } = useChat();
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

  // Load group messages on mount and when project changes
  useEffect(() => {
    if (projectId) {
      loadGroupMessages(projectId);
    }
  }, [projectId, loadGroupMessages]);

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

  function handleExportChat() {
    exportChatCSV(groupMsgs, activeProject?.name ?? "Project");
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 flex flex-col h-[calc(100vh-220px)] min-h-[500px] shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#f97316]" />
          <span className="font-semibold text-[#1a1a1a] text-sm">
            {activeProject?.name ?? "Project"} Chat
          </span>
        </div>
        {tab === "group" && groupMsgs.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="border-[#f97316] text-[#f97316] hover:bg-orange-50 text-xs h-7 px-2"
            onClick={handleExportChat}
            data-ocid="chat.export_button"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Export CSV
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 flex-shrink-0">
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
          data-ocid="inline-chat.group_tab"
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
          data-ocid="inline-chat.dm_tab"
        >
          📨 Direct Messages
        </button>
      </div>

      {/* DM member list */}
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
                data-ocid="inline-chat.dm.link"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor:
                      ROLE_COLORS[roleToLabel(m.role)] ?? "#64748b",
                  }}
                >
                  {m.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-400">
                    {roleToLabel(m.role)}
                  </p>
                </div>
              </button>
            ))}
          {members.filter((m) => m.email !== user?.email).length === 0 && (
            <div
              className="text-center py-12 text-slate-400 text-sm"
              data-ocid="inline-chat.dm.empty_state"
            >
              No other members in this project yet.
            </div>
          )}
        </div>
      )}

      {/* DM back bar */}
      {tab === "dm" && dmTarget && (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <button
            type="button"
            onClick={() => setDMTarget(null)}
            className="p-1 rounded hover:bg-slate-200"
            data-ocid="inline-chat.dm.close_button"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <span className="text-sm font-medium text-slate-700">
            {members.find((m) => m.email === dmTarget)?.name ?? dmTarget}
          </span>
        </div>
      )}

      {/* Message area */}
      {(tab === "group" || (tab === "dm" && dmTarget)) && (
        <>
          <ScrollArea className="flex-1 px-4 py-3">
            {messages.length === 0 && (
              <div
                className="text-center py-12"
                data-ocid="inline-chat.empty_state"
              >
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
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: roleColor }}
                        >
                          {msg.senderRole}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3 py-2 text-sm ${
                        isMe
                          ? "bg-[#f97316] text-white rounded-tr-sm"
                          : "bg-[#f4f5f7] text-slate-800 rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-slate-400">
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.reactions.length > 0 && (
                        <span className="text-xs bg-white border border-slate-200 rounded-full px-1.5 py-0.5">
                          {msg.reactions.slice(-3).join(" ")}
                        </span>
                      )}
                    </div>
                    {tab === "group" && (
                      <div className="flex gap-0.5 mt-0.5">
                        {QUICK_EMOJIS.slice(0, 4).map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() =>
                              addReaction(projectId, msg.id, emoji)
                            }
                            className="text-xs opacity-40 hover:opacity-100 transition-opacity"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </ScrollArea>

          {/* Quick emoji bar */}
          {showEmoji && (
            <div className="px-4 py-2 border-t border-slate-100 flex gap-2 flex-wrap flex-shrink-0">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setText((prev) => prev + emoji)}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="px-4 py-3 border-t border-gray-200 flex gap-2 items-center flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="text-xl hover:scale-110 transition-transform flex-shrink-0"
              data-ocid="inline-chat.emoji_toggle"
            >
              😊
            </button>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send)"
              className="flex-1 border-slate-200 focus-visible:ring-[#f97316]/40 text-sm"
              data-ocid="inline-chat.input"
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!text.trim()}
              className="bg-[#f97316] hover:bg-[#ea6c10] text-white flex-shrink-0 px-3"
              data-ocid="inline-chat.send_button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
