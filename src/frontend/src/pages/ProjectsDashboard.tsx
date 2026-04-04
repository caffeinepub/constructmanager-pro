import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Eye,
  EyeOff,
  HardHat,
  HelpCircle,
  Key,
  Lock,
  LogOut,
  Plus,
  Unlock,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type Project,
  type UserRole,
  roleToDashboardPath,
  roleToLabel,
  useAuth,
} from "../AuthContext";
import {
  canisterCreateProject,
  canisterGetAllProjects,
  canisterGetUserProjects,
} from "../canister";

const roleColor: Record<UserRole, string> = {
  chiefEngineer: "#f97316",
  siteOwner: "#8b5cf6",
  siteEngineer: "#0ea5e9",
  materialsEngineer: "#10b981",
};

const statusBg: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-yellow-100 text-yellow-700",
  Completed: "bg-slate-100 text-slate-600",
};

function mapCanisterProject(
  p: Awaited<ReturnType<typeof canisterGetUserProjects>>[number],
  userEmail: string,
  userRole: UserRole,
): Project {
  return {
    id: String(Number(p.id)),
    name: p.name,
    description: p.location,
    teamCode: p.teamCode,
    teamPassword: "", // never exposed from canister
    status: "Active" as const,
    budget: Number(p.budget),
    location: p.location,
    members: [
      // We include current user as member with their role
      { email: userEmail, name: userEmail, role: userRole },
    ],
  };
}

export default function ProjectsDashboard() {
  const {
    user,
    projects,
    setProjects,
    cachedCodes,
    enterProject,
    setActiveProject,
    addProject,
    joinProject,
    logout,
  } = useAuth();
  const navigate = useNavigate();

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [teamPassword, setTeamPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [enteringProject, setEnteringProject] = useState(false);

  // CE: show all vs my projects
  const [showAll, setShowAll] = useState(false);

  // Create new project modal (CE only)
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTeamCode, setNewTeamCode] = useState("");
  const [newTeamPw, setNewTeamPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [newStatus, setNewStatus] = useState<
    "Active" | "On Hold" | "Completed"
  >("Active");
  const [creatingProject, setCreatingProject] = useState(false);

  // Join project modal
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinPw, setJoinPw] = useState("");
  const [joinRole, setJoinRole] = useState<UserRole>(
    user?.role ?? "siteEngineer",
  );
  const [joinError, setJoinError] = useState("");
  const [joiningProject, setJoiningProject] = useState(false);

  const isChief = user?.role === "chiefEngineer";

  // Load user's projects from canister on mount
  useEffect(() => {
    if (!user) return;
    setLoadingProjects(true);

    const fetchProjects = async () => {
      try {
        let raw: Awaited<ReturnType<typeof canisterGetUserProjects>>;
        if (isChief && showAll) {
          raw = await canisterGetAllProjects();
        } else {
          raw = await canisterGetUserProjects(user.email);
        }
        const mapped = raw.map((p) =>
          mapCanisterProject(p, user.email, user.role),
        );
        setProjects(mapped);
      } catch (err) {
        console.error("Failed to load projects:", err);
        toast.error("Failed to load projects");
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [user, isChief, showAll, setProjects]);

  function getUserRoleInProject(_project: Project): UserRole {
    return user?.role ?? "siteEngineer";
  }

  function handleProjectClick(project: Project) {
    const roleInProject = getUserRoleInProject(project);
    const isCached = cachedCodes.has(project.id);
    if (isCached) {
      setActiveProject(project);
      navigate({ to: roleToDashboardPath(roleInProject) });
    } else {
      setSelectedProject(project);
      setTeamPassword("");
      setPasswordError("");
    }
  }

  async function handleEnterProject() {
    if (!selectedProject) return;
    setEnteringProject(true);
    try {
      const ok = await enterProject(selectedProject.id, teamPassword);
      if (ok) {
        const role = getUserRoleInProject(selectedProject);
        navigate({ to: roleToDashboardPath(role) });
      } else {
        setPasswordError("Incorrect Team Password. Please try again.");
      }
    } finally {
      setEnteringProject(false);
    }
  }

  async function handleCreateProject() {
    if (!newName.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!newTeamCode.trim()) {
      toast.error("Team Code is required");
      return;
    }
    if (!newTeamPw.trim()) {
      toast.error("Team Password is required");
      return;
    }
    if (!user) return;
    setCreatingProject(true);
    try {
      const result = await canisterCreateProject(
        user.email,
        newName.trim(),
        newLocation.trim() || newDesc.trim(),
        new Date().toISOString().split("T")[0],
        newTeamCode.trim().toUpperCase(),
        newTeamPw.trim(),
        0,
      );
      if (!result.ok) {
        toast.error(result.message || "Failed to create project");
        return;
      }
      const newProject: Project = {
        id: String(Number(result.projectId)),
        name: newName.trim(),
        description: newDesc.trim(),
        teamCode: newTeamCode.trim().toUpperCase(),
        teamPassword: newTeamPw.trim(),
        status: newStatus,
        budget: 0,
        location: newLocation.trim(),
        members: [{ email: user.email, name: user.name, role: user.role }],
      };
      addProject(newProject);
      toast.success(`Project "${newName}" created!`);
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      setNewTeamCode("");
      setNewTeamPw("");
      setNewLocation("");
    } catch (err) {
      toast.error(String(err));
    } finally {
      setCreatingProject(false);
    }
  }

  async function handleJoinProject() {
    if (!joinCode.trim()) {
      setJoinError("Please enter a Team Code");
      return;
    }
    if (!joinPw.trim()) {
      setJoinError("Please enter the Team Password");
      return;
    }
    setJoiningProject(true);
    try {
      const result = await joinProject(
        joinCode.trim(),
        joinPw.trim(),
        joinRole,
      );
      if (result.ok) {
        // Reload projects
        if (user) {
          const raw = await canisterGetUserProjects(user.email);
          const mapped = raw.map((p) =>
            mapCanisterProject(p, user.email, user.role),
          );
          setProjects(mapped);
        }
        toast.success("Joined project!");
        setJoinOpen(false);
        setJoinCode("");
        setJoinPw("");
      } else {
        setJoinError(result.message || "Invalid Team Code or Password.");
      }
    } catch (err) {
      setJoinError(String(err));
    } finally {
      setJoiningProject(false);
    }
  }

  function handleLogout() {
    logout();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 text-[#1a1a1a] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold">
                ConstructManager <span className="text-[#f97316]">Pro</span>
              </span>
              {user && (
                <span className="ml-3 text-xs text-slate-400">
                  Welcome, {user.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/user-manual">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-[#1a1a1a]"
              >
                <HelpCircle className="w-4 h-4 mr-1" /> Manual
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-red-400"
              onClick={handleLogout}
              data-ocid="projects.logout.button"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title row */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">My Projects</h1>
            {user && (
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className="text-xs"
                  style={{
                    backgroundColor: `${roleColor[user.role]}20`,
                    color: roleColor[user.role],
                  }}
                >
                  {roleToLabel(user.role)}
                </Badge>
                <span className="text-sm text-slate-400">{user.email}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isChief && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="border-slate-300"
                  data-ocid="projects.toggle"
                >
                  {showAll ? "My Projects" : "All Projects"}
                </Button>
                <Button
                  size="sm"
                  className="bg-[#f97316] hover:bg-[#ea6c10] text-white"
                  onClick={() => setCreateOpen(true)}
                  data-ocid="projects.open_modal_button"
                >
                  <Plus className="w-4 h-4 mr-1" /> New Project
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJoinOpen(true)}
              className="border-[#f97316] text-[#f97316] hover:bg-[#f97316]/5"
              data-ocid="projects.join.open_modal_button"
            >
              <UserPlus className="w-4 h-4 mr-1" /> Join Project
            </Button>
          </div>
        </div>

        {/* CE-only role note */}
        {!isChief && (
          <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
            <strong>Note:</strong> Only Chief Engineers can create new projects.
            Use "Join Project" with a Team Code and Password from your Chief
            Engineer.
          </div>
        )}

        {/* Projects grid */}
        {loadingProjects ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="projects.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16" data-ocid="projects.empty_state">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-500">No projects yet</h3>
            <p className="text-sm text-slate-400 mt-1">
              {isChief
                ? 'Create your first project using the "New Project" button.'
                : "Ask your Chief Engineer for a Team Code and Password to join a project."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, idx) => {
              const memberRole = getUserRoleInProject(project);
              const isCached = cachedCodes.has(project.id);
              return (
                <button
                  key={project.id}
                  type="button"
                  className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-[#f97316]/50 hover:shadow-md transition-all text-left w-full"
                  onClick={() => handleProjectClick(project)}
                  data-ocid={`projects.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#f97316]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!isCached ? (
                        <Lock className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Unlock className="w-4 h-4 text-green-500" />
                      )}
                      <Badge className={`text-xs ${statusBg[project.status]}`}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="font-bold text-[#0f172a] mb-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {project.description || project.location}
                  </p>
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: `${roleColor[memberRole]}15`,
                      color: roleColor[memberRole],
                    }}
                  >
                    {roleToLabel(memberRole)}
                  </Badge>
                  {project.location && (
                    <p className="text-xs text-slate-400 mt-2">
                      📍 {project.location}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Enter Project Modal (Team Password) */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter Team Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-500">
              Enter the Team Password for{" "}
              <strong>{selectedProject?.name}</strong> to access this project.
            </p>
            <div>
              <Label>Team Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={teamPassword}
                  onChange={(e) => {
                    setTeamPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter team password"
                  onKeyDown={(e) => e.key === "Enter" && handleEnterProject()}
                  className="pr-10"
                  data-ocid="projects.passcode.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="projects.passcode.error_state"
                >
                  {passwordError}
                </p>
              )}
            </div>
            <Button
              className="w-full bg-[#f97316] hover:bg-[#ea6c10] text-white"
              onClick={handleEnterProject}
              disabled={enteringProject}
              data-ocid="projects.passcode.submit_button"
            >
              <Key className="w-4 h-4 mr-2" />
              {enteringProject ? "Verifying..." : "Enter Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Project Modal (CE only) */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent
          className="sm:max-w-lg"
          data-ocid="projects.create.dialog"
        >
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Project Name *</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Residential Block A"
                className="mt-1"
                data-ocid="projects.create.input"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief description"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="City, area"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as typeof newStatus)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-blue-700">
                🔐 Project Access Credentials (Keep these separate!)
              </p>
              <div>
                <Label>Team Code (Join Code) *</Label>
                <p className="text-xs text-slate-400 mb-1">
                  Short alphanumeric code team members use to find this project
                </p>
                <Input
                  value={newTeamCode}
                  onChange={(e) => setNewTeamCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SITE42"
                  className="mt-1 uppercase font-mono"
                  data-ocid="projects.create.input"
                />
              </div>
              <div>
                <Label>Team Password (Access Password) *</Label>
                <p className="text-xs text-slate-400 mb-1">
                  Stronger password for project access (separate from Team Code)
                </p>
                <div className="relative mt-1">
                  <Input
                    type={showNewPw ? "text" : "password"}
                    value={newTeamPw}
                    onChange={(e) => setNewTeamPw(e.target.value)}
                    placeholder="e.g. Site@secure2024"
                    className="pr-10"
                    data-ocid="projects.create.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showNewPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-[#f97316] hover:bg-[#ea6c10] text-white"
              onClick={handleCreateProject}
              disabled={creatingProject}
              data-ocid="projects.create.submit_button"
            >
              <Plus className="w-4 h-4 mr-2" />
              {creatingProject ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Project Modal */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="sm:max-w-sm" data-ocid="projects.join.dialog">
          <DialogHeader>
            <DialogTitle>Join a Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-500">
              Enter the Team Code and Team Password provided by your Chief
              Engineer to join an existing project.
            </p>
            <div>
              <Label>Team Code</Label>
              <Input
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value);
                  setJoinError("");
                }}
                placeholder="e.g. ALPHA42"
                className="mt-1 uppercase font-mono"
                data-ocid="projects.join.input"
              />
            </div>
            <div>
              <Label>Team Password</Label>
              <Input
                type="password"
                value={joinPw}
                onChange={(e) => {
                  setJoinPw(e.target.value);
                  setJoinError("");
                }}
                placeholder="Enter team password"
                className="mt-1"
                data-ocid="projects.join.input"
              />
            </div>
            <div>
              <Label>Your Role in This Project</Label>
              <Select
                value={joinRole}
                onValueChange={(v) => setJoinRole(v as UserRole)}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="projects.join.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chiefEngineer">Chief Engineer</SelectItem>
                  <SelectItem value="siteEngineer">Site Engineer</SelectItem>
                  <SelectItem value="materialsEngineer">
                    Materials Engineer
                  </SelectItem>
                  <SelectItem value="siteOwner">Site Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {joinError && (
              <p
                className="text-xs text-red-500"
                data-ocid="projects.join.error_state"
              >
                {joinError}
              </p>
            )}
            <Button
              className="w-full bg-[#f97316] hover:bg-[#ea6c10] text-white"
              onClick={handleJoinProject}
              disabled={joiningProject}
              data-ocid="projects.join.submit_button"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {joiningProject ? "Joining..." : "Join Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400">
        &copy; {new Date().getFullYear()} ConstructManager Pro &bull; Built with
        ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#f97316] hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
