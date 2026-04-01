import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { isAdminRole, roleToLabel, useAuth } from "../AuthContext";

const TEAM_MEMBERS_MOCK = [
  {
    name: "Rajan S",
    email: "rajan.s@krct.ac.in",
    role: "siteEngineer",
    lastReset: "Never",
  },
  {
    name: "Priya K",
    email: "priya.k@krct.ac.in",
    role: "materialsEngineer",
    lastReset: "Nov 01",
  },
  {
    name: "Suresh M",
    email: "suresh.m@krct.ac.in",
    role: "siteEngineer",
    lastReset: "Oct 22",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PasswordManagement({ open, onClose }: Props) {
  const { user, changePassword, resetMemberPassword } = useAuth();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [resetStates, setResetStates] = useState<Record<string, string>>({});

  // Show/hide toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!user) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPw.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setPwSuccess("Password updated successfully.");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch {
      setPwError("Failed to update password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleReset = async (email: string) => {
    setResetStates((prev) => ({ ...prev, [email]: "loading" }));
    await resetMemberPassword(email);
    setResetStates((prev) => ({ ...prev, [email]: "done" }));
  };

  const isAdmin = isAdminRole(user.role);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#0f2044] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#f97316]" /> Password Management
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="change">
          <TabsList className="w-full">
            <TabsTrigger value="change" className="flex-1">
              Change My Password
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="reset" className="flex-1">
                Team Reset
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="change" className="pt-4">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="cp-current">Current Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="cp-current"
                    type={showCurrent ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    required
                    className="pr-10"
                    data-ocid="password_mgmt.current_pw.input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    onClick={() => setShowCurrent((v) => !v)}
                    tabIndex={-1}
                  >
                    {showCurrent ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="cp-new">New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="cp-new"
                    type={showNew ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    required
                    className="pr-10"
                    data-ocid="password_mgmt.new_pw.input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    onClick={() => setShowNew((v) => !v)}
                    tabIndex={-1}
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="cp-confirm">Confirm New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="cp-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    required
                    className="pr-10"
                    data-ocid="password_mgmt.confirm_pw.input"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {pwError && (
                <p
                  className="text-sm text-red-500 bg-red-50 p-2 rounded"
                  data-ocid="password_mgmt.error_state"
                >
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p
                  className="text-sm text-green-600 bg-green-50 p-2 rounded"
                  data-ocid="password_mgmt.success_state"
                >
                  {pwSuccess}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-[#0f2044] hover:bg-[#162d5c] text-white"
                disabled={pwLoading}
                data-ocid="password_mgmt.submit_button"
              >
                {pwLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="reset" className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-[#f97316]" />
                <p className="text-sm font-medium text-[#0f2044]">
                  Admin: Reset Team Member Passwords
                </p>
              </div>
              <div className="space-y-2">
                {TEAM_MEMBERS_MOCK.map((m) => (
                  <div
                    key={m.email}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#0f2044]">
                        {m.name}
                      </p>
                      <p className="text-xs text-[#6b7280]">
                        {m.email} &bull; {roleToLabel(m.role)}
                      </p>
                      <p className="text-xs text-[#6b7280]">
                        Last reset: {m.lastReset}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleReset(m.email)}
                      disabled={resetStates[m.email] === "loading"}
                    >
                      {resetStates[m.email] === "done" ? (
                        <span className="text-green-600">Sent ✓</span>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6b7280] mt-3">
                Clicking &ldquo;Reset&rdquo; sends a password reset notification
                to the member's email.
              </p>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
