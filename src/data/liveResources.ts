export interface LiveResource {
  id: string;
  title: string;
  type: "pdf" | "github" | "docs" | "zip" | "link";
  size?: string;
  url: string;
  description: string;
  addedAt: string;
}

export const mockLiveResources: LiveResource[] = [
  {
    id: "res-1",
    title: "Class Notes — React 19 Architecture.pdf",
    type: "pdf",
    size: "Planned file",
    url: "",
    description: "Architecture slides will be available when class file storage is connected.",
    addedAt: "10 mins ago",
  },
  {
    id: "res-2",
    title: "Starter Repository & Solution Branch",
    type: "github",
    size: "Git Repo",
    url: "",
    description: "The starter repository will be linked when instructor resources are connected.",
    addedAt: "15 mins ago",
  },
  {
    id: "res-3",
    title: "React 19 Official RFC & Documentation",
    type: "docs",
    size: "Online Guide",
    url: "https://react.dev/reference/react/useActionState",
    description: "Official core documentation for useActionState, useOptimistic, and Server Actions specifications.",
    addedAt: "20 mins ago",
  },
  {
    id: "res-4",
    title: "Project Assets & Database Seed Scripts.zip",
    type: "zip",
    size: "Planned file",
    url: "",
    description: "Project files will be available when class file storage is connected.",
    addedAt: "25 mins ago",
  },
];
