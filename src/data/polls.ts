export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface LivePoll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  status: "active" | "closed";
  userVotedOptionId?: string;
}

export const mockInitialPolls: LivePoll[] = [
  {
    id: "poll-1",
    question: "What is the correct React Server Action directive?",
    options: [
      { id: "opt-1", text: '"use server"', votes: 114 },
      { id: "opt-2", text: '"use client"', votes: 8 },
      { id: "opt-3", text: "serverAction()", votes: 4 },
      { id: "opt-4", text: "createAction()", votes: 2 },
    ],
    totalVotes: 128,
    status: "active",
  },
];
