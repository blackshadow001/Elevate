export interface LiveChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "learner" | "instructor" | "co-host";
  senderAvatar: string;
  text: string;
  timestamp: string;
  isInstructor?: boolean;
}

export interface LiveQuestion {
  id: string;
  authorName: string;
  authorAvatar: string;
  question: string;
  timestamp: string;
  upvotes: number;
  isAnswered: boolean;
  answerText?: string;
  answeredBy?: string;
}

export const mockInitialChatMessages: LiveChatMessage[] = [
  {
    id: "msg-1",
    senderId: "usr_002",
    senderName: "John Doe",
    senderRole: "instructor",
    senderAvatar: "/images/first-version/photo-1472099645785-5658abf4ff4e.jpg",
    text: "Welcome everyone! Today we're exploring React 19 Server Functions, caching semantics, and optimistic form mutations.",
    timestamp: "7:01 PM",
    isInstructor: true,
  },
  {
    id: "msg-2",
    senderId: "p_002",
    senderName: "Kavita R.",
    senderRole: "learner",
    senderAvatar: "/images/first-version/photo-1494790108377-be9c29b29330.jpg",
    text: "Audio and screen share look crystal clear from Mumbai! 🙌",
    timestamp: "7:02 PM",
  },
  {
    id: "msg-3",
    senderId: "p_003",
    senderName: "Rohan V.",
    senderRole: "learner",
    senderAvatar: "/images/first-version/photo-1507003211169-0a1dd7228f2d.jpg",
    text: "Excited for this! Can't wait to see how optimistic mutations replace old TanStack query patterns.",
    timestamp: "7:03 PM",
  },
  {
    id: "msg-4",
    senderId: "p_006",
    senderName: "Sneha Patel",
    senderRole: "co-host",
    senderAvatar: "/images/first-version/photo-1580489944761-15a19d654956.jpg",
    text: "Reminder: Drop code questions in the Q&A tab so John can address them during pauses! 📌",
    timestamp: "7:05 PM",
  },
  {
    id: "msg-5",
    senderId: "p_005",
    senderName: "Devansh Mehta",
    senderRole: "learner",
    senderAvatar: "/images/first-version/photo-1500648767791-00dcc994a43e.jpg",
    text: "The slide on RSC boundaries is pure gold. Taking notes right now.",
    timestamp: "7:09 PM",
  },
];

export const mockInitialQuestions: LiveQuestion[] = [
  {
    id: "qa-1",
    authorName: "Kavita R.",
    authorAvatar: "/images/first-version/photo-1494790108377-be9c29b29330.jpg",
    question: "Does React 19 support formAction directly on buttons without wrapping them in useTransition?",
    timestamp: "7:06 PM",
    upvotes: 18,
    isAnswered: true,
    answerText: "Yes! React 19 handles formAction on buttons automatically with implicit pending transitions and FormData forwarding.",
    answeredBy: "John Doe",
  },
  {
    id: "qa-2",
    authorName: "Rohan V.",
    authorAvatar: "/images/first-version/photo-1507003211169-0a1dd7228f2d.jpg",
    question: "How do Server Actions interact with cookie authentication when running in microservices architecture?",
    timestamp: "7:12 PM",
    upvotes: 12,
    isAnswered: false,
  },
  {
    id: "qa-3",
    authorName: "Devansh Mehta",
    authorAvatar: "/images/first-version/photo-1500648767791-00dcc994a43e.jpg",
    question: "Should we still use useFormStatus or is useActionState the recommended standard moving forward?",
    timestamp: "7:14 PM",
    upvotes: 9,
    isAnswered: true,
    answerText: "useActionState is preferred for returning data and error state; useFormStatus is specifically for nested child components needing parent pending state.",
    answeredBy: "John Doe",
  },
];
