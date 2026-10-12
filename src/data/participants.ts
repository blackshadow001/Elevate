export interface Participant {
  id: string;
  name: string;
  role: "learner" | "instructor" | "co-host";
  avatar: string;
  isHandRaised: boolean;
  status: "Connected" | "Connecting" | "Poor connection";
  isAudioMuted: boolean;
  isVideoOn: boolean;
  isPinned: boolean;
  joinedAt: string;
}

export const mockParticipants: Participant[] = [
  {
    id: "usr_001",
    name: "Alex Johnson (You)",
    role: "learner",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    isHandRaised: true,
    status: "Connected",
    isAudioMuted: true,
    isVideoOn: false,
    isPinned: false,
    joinedAt: "18 mins ago",
  },
  {
    id: "p_002",
    name: "Kavita R.",
    role: "learner",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    isHandRaised: false,
    status: "Connected",
    isAudioMuted: true,
    isVideoOn: true,
    isPinned: false,
    joinedAt: "24 mins ago",
  },
  {
    id: "p_003",
    name: "Rohan V.",
    role: "learner",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    isHandRaised: false,
    status: "Connected",
    isAudioMuted: true,
    isVideoOn: false,
    isPinned: false,
    joinedAt: "12 mins ago",
  },
  {
    id: "p_004",
    name: "Priya S.",
    role: "learner",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    isHandRaised: false,
    status: "Poor connection",
    isAudioMuted: true,
    isVideoOn: false,
    isPinned: false,
    joinedAt: "30 mins ago",
  },
  {
    id: "p_005",
    name: "Devansh Mehta",
    role: "learner",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    isHandRaised: true,
    status: "Connected",
    isAudioMuted: true,
    isVideoOn: false,
    isPinned: false,
    joinedAt: "15 mins ago",
  },
  {
    id: "p_006",
    name: "Sneha Patel",
    role: "co-host",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
    isHandRaised: false,
    status: "Connected",
    isAudioMuted: false,
    isVideoOn: true,
    isPinned: true,
    joinedAt: "35 mins ago",
  },
  {
    id: "p_007",
    name: "Arun Kumar",
    role: "learner",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200",
    isHandRaised: false,
    status: "Connected",
    isAudioMuted: true,
    isVideoOn: false,
    isPinned: false,
    joinedAt: "8 mins ago",
  },
  {
    id: "p_008",
    name: "Divya Teja",
    role: "learner",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    isHandRaised: false,
    status: "Connected",
    isAudioMuted: true,
    isVideoOn: false,
    isPinned: false,
    joinedAt: "5 mins ago",
  },
];
