import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart2,
  CalendarCheck,
  DollarSign,
  Loader2,
  Users,
} from "lucide-react";
import { roleToLabel, useAuth } from "../../AuthContext";
import type { DashboardSummary } from "../../backend";
import DashboardLayout from "../../components/DashboardLayout";
import { useActor } from "../../hooks/useActor";

const mockSummary: DashboardSummary = {
  projects: [
    {
      name: "Greenfield Residential Block A",
      site: "Chennai North",
      status: "Active",
      budget: BigInt(5000000),
    },
    {
      name: "Commercial Plaza Foundation",
      site: "Anna Nagar",
      status: "Active",
      budget: BigInt(12000000),
    },
    {
      name: "Highway Overpass Section 3",
      site: "Tambaram",
      status: "Completed",
      budget: BigInt(8500000),
    },
  ],
  teamList: [
    {
      name: "Arjun Kumar",
      email: "arjun@example.com",
      role: "siteEngineer" as never,
      hashedPassword: "",
    },
    {
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "chiefEngineer" as never,
      hashedPassword: "",
    },
    {
      name: "Ravi Verma",
      email: "ravi@example.com",
      role: "materialsEngineer" as never,
      hashedPassword: "",
    },
  ],
  attendanceSummary: BigInt(247),
  financialOverview: BigInt(25500000),
};

const statusStyle: Record<string, { color: string; bg: string }> = {
  Active: { color: "#1FA6A3", bg: "rgba(31,166,163,0.1)" },
  Completed: { color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  "On Hold": { color: "#F28C2A", bg: "rgba(242,140,42,0.1)" },
};

export default function SiteOwnerDashboard() {
  const { user } = useAuth();
  const { actor, isFetching } = useActor();

  const { data: summary = mockSummary, isLoading } = useQuery<DashboardSummary>(
    {
      queryKey: ["dashboard-summary"],
      queryFn: async () => {
        if (!actor) return mockSummary;
        try {
          return await actor.getFullDashboardSummary();
        } catch {
          return mockSummary;
        }
      },
      enabled: !!actor && !isFetching,
    },
  );

  const statCards = [
    {
      label: "Total Projects",
      value: summary.projects.length,
      icon: BarChart2,
      color: "#0B2B45",
    },
    {
      label: "Team Members",
      value: summary.teamList.length,
      icon: Users,
      color: "#1FA6A3",
    },
    {
      label: "Workers Present",
      value: Number(summary.attendanceSummary),
      icon: CalendarCheck,
      color: "#F28C2A",
    },
    {
      label: "Total Budget",
      value: `₹${(Number(summary.financialOverview) / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "#16A34A",
    },
  ];

  return (
    <DashboardLayout title="Site Owner Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0B2B45]">
            Welcome, {user?.name ?? "Site Owner"} 🏢
          </h2>
          <p className="text-[#6B7280] text-sm mt-1">
            Full platform overview — projects, team, and financials.
          </p>
        </div>

        {/* Stat cards */}
        {isLoading ? (
          <div
            className="flex items-center justify-center py-16"
            data-ocid="dashboard.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-[#F28C2A]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <Card
                key={stat.label}
                className="card-shadow border-border"
                data-ocid={`dashboard.card.${i + 1}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#6B7280] uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p
                        className="text-2xl font-bold mt-1"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <stat.icon
                        className="w-5 h-5"
                        style={{ color: stat.color }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Projects table */}
        <Card className="card-shadow border-border" data-ocid="projects.table">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#0B2B45]">Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: "#F4F7FA" }}>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Project
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Site
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                    Budget
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.projects.map((p, i) => {
                  const style = statusStyle[p.status] ?? {
                    color: "#64748b",
                    bg: "rgba(100,116,139,0.1)",
                  };
                  return (
                    <TableRow key={p.name} data-ocid={`projects.item.${i + 1}`}>
                      <TableCell className="font-medium text-sm text-[#0B2B45]">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        {p.site}
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                          }}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-[#0B2B45]">
                        ₹{Number(p.budget).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Team table */}
        <Card className="card-shadow border-border" data-ocid="team.table">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#0B2B45] flex items-center gap-2">
              <Users className="w-5 h-5" /> Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {summary.teamList.length === 0 ? (
              <div
                className="text-center py-12 text-[#6B7280]"
                data-ocid="team.empty_state"
              >
                No team members yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow style={{ backgroundColor: "#F4F7FA" }}>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Email
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-[#6B7280] uppercase">
                      Role
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.teamList.map((member, i) => (
                    <TableRow
                      key={member.email}
                      data-ocid={`team.item.${i + 1}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#0B2B45] flex items-center justify-center text-white text-xs font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <span className="font-medium text-sm text-[#0B2B45]">
                            {member.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#6B7280]">
                        {member.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: "rgba(11,43,69,0.1)",
                            color: "#0B2B45",
                          }}
                        >
                          {roleToLabel(member.role)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
