import { LiveClass } from "@/data/liveClasses";
import { Bootcamp } from "@/data/bootcamps";
import { LiveEvent } from "@/data/events";
import { Participant } from "@/data/participants";
import { LiveChatMessage, LiveQuestion } from "@/data/chatMessages";
import { LivePoll } from "@/data/polls";
import { LiveResource } from "@/data/liveResources";

// Non-authoritative classroom preview state. Scheduling and registration use the API.
let participantsStore: Participant[] = [];
let chatMessagesStore: LiveChatMessage[] = [];
let questionsStore: LiveQuestion[] = [];
let pollsStore: LivePoll[] = [];
let resourcesStore: LiveResource[] = [];

type ApiLive = { id: string; courseId: string | null; courseTitle: string | null; activeParticipants: number;
  instructor: { id: string; name: string }; title: string;
  description: string; scheduledAt: string; durationMinutes: number; status: string; provider: string | null; providerReady: boolean; meetingUrl?: string | null; recordingAvailable?: boolean };
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", cache: "no-store", ...init });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "Unable to load live learning information.");
  return body.data as T;
}
function jsonBody(data: unknown): Pick<RequestInit, "headers" | "body"> {
  return { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}
function toLive(item: ApiLive): LiveClass {
  const scheduled = new Date(item.scheduledAt);
  return {
    id: item.id, title: item.title, courseId: item.courseId || "", courseTitle: item.courseTitle || "Open class",
    instructorId: item.instructor.id, instructorName: item.instructor.name,
    instructorRole: "Instructor",
    instructorAvatar: "",
    scheduledAt: scheduled.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Kolkata" }),
    startTime: scheduled.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" }),
    duration: item.durationMinutes, status: item.status === "ended" ? "completed" : item.status as LiveClass["status"],
    description: item.description, attendeesCount: item.activeParticipants, registeredCount: item.activeParticipants,
    tags: [], provider: "custom", platform: "custom", meetingUrl: item.meetingUrl || undefined,
    recordingAvailable: item.recordingAvailable || false,
  };
}
type ApiEvent = { id: string; slug: string; title: string; description: string; eventType: string;
  scheduledAt: string; price: number; registeredCount: number; speaker: { id: string; name: string } | null };
function toEvent(item: ApiEvent): LiveEvent {
  const date = new Date(item.scheduledAt);
  return {
    id: item.id, slug: item.slug, title: item.title, description: item.description,
    speaker: item.speaker?.name || "Elevate instructor",
    speakerRole: "Instructor", speakerCompany: "",
    speakerAvatar: "", date: date.toLocaleDateString("en-IN", { dateStyle: "full", timeZone: "Asia/Kolkata" }),
    time: date.toLocaleTimeString("en-IN", { timeStyle: "short", timeZone: "Asia/Kolkata" }) + " IST",
    duration: 60, detailedAgenda: [],
    registeredCount: item.registeredCount, isPaid: item.price > 0, price: item.price, currency: "INR",
    category: (["workshop", "masterclass", "qa", "hackathon", "industry"].includes(item.eventType) ? item.eventType : "workshop") as LiveEvent["category"],
    tags: [], coverImage: "", isRegistered: false,
  };
}
type ApiBootcamp = { id: string; slug: string; title: string; description: string; status: string;
  startDate: string; endDate: string; registeredCount: number; instructor: { id: string; name: string };
  sessions: { id: string; title: string; description: string; durationMinutes: number; assignmentTitle: string | null;
    sessionDate: string; position: number; liveClassId: string | null; liveClassStatus: string | null }[] };
export function sessionDateInput(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function toBootcamp(item: ApiBootcamp): Bootcamp {
  const fmt = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  return {
    id: item.id, slug: item.slug, title: item.title, description: item.description,
    tagline: item.description,
    dateRange: `${fmt(item.startDate)} – ${fmt(item.endDate)}`,
    totalDays: item.sessions.length, liveSessionsCount: item.sessions.length,
    projectsCount: 0, enrolledLearners: item.registeredCount,
    instructorName: item.instructor.name, instructorRole: "Instructor",
    instructorAvatar: "", coverImage: "",
    tags: [], userProgressPercent: 0,
    sessions: item.sessions.map((session, index) => {
      const date = new Date(session.sessionDate);
      return { dayNumber: index + 1, title: session.title, description: session.description || "",
        date: fmt(session.sessionDate), time: date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) + " IST",
        duration: session.durationMinutes, status: session.liveClassStatus === "live" ? "live" : date < new Date() ? "completed" : "upcoming",
        liveClassId: session.liveClassId || undefined, assignmentTitle: session.assignmentTitle || undefined,
        resourcesCount: 0 };
    }),
  };
}

export const liveService = {
  // Live Classes
  async getLiveClasses(): Promise<LiveClass[]> {
    return (await api<ApiLive[]>("/api/live/classes")).map(toLive);
  },

  async getLiveClass(id: string): Promise<LiveClass | undefined> {
    try { return toLive(await api<ApiLive>(`/api/live/classes/${encodeURIComponent(id)}`)); }
    catch { return undefined; }
  },

  async getLiveNow(): Promise<LiveClass | undefined> {
    return (await this.getLiveClasses()).find((c) => c.status === "live");
  },

  async getUpcomingClasses(): Promise<LiveClass[]> {
    return (await this.getLiveClasses()).filter((c) => c.status === "scheduled");
  },

  async getCompletedClasses(): Promise<LiveClass[]> {
    return (await this.getLiveClasses()).filter((c) => c.status === "completed");
  },

  async getInstructorLiveClasses(instructorId?: string): Promise<LiveClass[]> {
    const classes = (await api<ApiLive[]>("/api/instructor/live-classes")).map(toLive);
    return instructorId ? classes.filter((c) => c.instructorId === instructorId) : classes;
  },

  async createLiveClass(data: Omit<LiveClass, "id" | "attendeesCount">): Promise<LiveClass> {
    const scheduledAt = new Date(`${data.scheduledAt}T${data.startTime}:00+05:30`);
    if (Number.isNaN(scheduledAt.getTime())) throw new Error("Choose a valid class date and time.");
    const created = await api<ApiLive>("/api/instructor/live-classes", { method: "POST", ...jsonBody({
      title: data.title, description: data.description, courseId: data.courseId || null,
      scheduledAt: scheduledAt.toISOString(), durationMinutes: data.duration, meetingUrl: data.meetingUrl || null,
    }) });
    return toLive(created);
  },

  async updateLiveClassStatus(id: string, status: LiveClass["status"]): Promise<LiveClass | undefined> {
    if (status === "scheduled") return this.getLiveClass(id);
    const updated = await api<ApiLive>(`/api/instructor/live-classes/${encodeURIComponent(id)}`, {
      method: "PATCH", ...jsonBody({ status: status === "completed" ? "ended" : status }),
    });
    return toLive(updated);
  },

  async updateLiveClass(id: string, changes: Partial<Pick<LiveClass, "title" | "description" | "scheduledAt" | "startTime" | "duration" | "meetingUrl">>): Promise<LiveClass | undefined> {
    const current = await this.getLiveClass(id);
    if (!current) return undefined;
    const date = changes.scheduledAt || current.scheduledAt;
    const time = changes.startTime || current.startTime;
    const scheduledAt = new Date(`${date}T${time}:00+05:30`);
    if (Number.isNaN(scheduledAt.getTime())) throw new Error("Choose a valid class date and time.");
    const updated = await api<ApiLive>(`/api/instructor/live-classes/${encodeURIComponent(id)}`, {
      method: "PATCH", ...jsonBody({ title: changes.title || current.title, description: changes.description ?? current.description,
        scheduledAt: scheduledAt.toISOString(), durationMinutes: changes.duration || current.duration,
        ...(changes.meetingUrl !== undefined ? { meetingUrl: changes.meetingUrl } : {}) }),
    });
    return toLive(updated);
  },

  async rescheduleLiveClass(id: string, changes: Pick<LiveClass, "title" | "description" | "scheduledAt" | "startTime" | "duration"> & Pick<LiveClass, "meetingUrl">): Promise<LiveClass> {
    const scheduledAt = new Date(`${changes.scheduledAt}T${changes.startTime}:00+05:30`);
    if (Number.isNaN(scheduledAt.getTime())) throw new Error("Choose a valid class date and time.");
    const updated = await api<ApiLive>(`/api/instructor/live-classes/${encodeURIComponent(id)}`, {
      method: "PATCH", ...jsonBody({
        title: changes.title, description: changes.description, scheduledAt: scheduledAt.toISOString(),
        durationMinutes: changes.duration, status: "scheduled", meetingUrl: changes.meetingUrl || null,
      }),
    });
    return toLive(updated);
  },

  async toggleClassReminder(id: string): Promise<boolean> {
    const path = `/api/live/classes/${encodeURIComponent(id)}/reminder`;
    const current = await api<{ reminderSet: boolean }>(path);
    const next = await api<{ reminderSet: boolean }>(path, { method: current.reminderSet ? "DELETE" : "POST" });
    return next.reminderSet;
  },
  async isReminderSet(id: string): Promise<boolean> {
    return (await api<{ reminderSet: boolean }>(`/api/live/classes/${encodeURIComponent(id)}/reminder`)).reminderSet;
  },
  async joinLiveClass(id: string): Promise<{ access: string; activeParticipants: number; meetingUrl: string | null }> {
    return api(`/api/live/classes/${encodeURIComponent(id)}/join`, { method: "POST" });
  },
  async leaveLiveClass(id: string): Promise<void> {
    await api(`/api/live/classes/${encodeURIComponent(id)}/leave`, { method: "POST" });
  },
  async getClassMessages(id: string): Promise<LiveChatMessage[]> {
    const result = await api<{ items: Array<{ id: string; body: string; createdAt: string;
      author: { id: string; name: string } }> }>(`/api/live/classes/${encodeURIComponent(id)}/messages`);
    return result.items.map((message) => ({
      id: message.id, senderId: message.author.id, senderName: message.author.name,
      senderRole: "learner", senderAvatar: "", text: message.body,
      timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    }));
  },
  async sendClassMessage(id: string, text: string): Promise<LiveChatMessage> {
    const result = await api<{ id: string; body: string; author: { id: string; name: string } }>(
      `/api/live/classes/${encodeURIComponent(id)}/messages`,
      { method: "POST", ...jsonBody({ message: text }) });
    return { id: result.id, senderId: result.author.id, senderName: result.author.name,
      senderRole: "learner", senderAvatar: "", text: result.body,
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) };
  },

  // Bootcamps
  async getBootcamps(): Promise<Bootcamp[]> {
    return (await api<ApiBootcamp[]>("/api/bootcamps")).map(toBootcamp);
  },

  async getBootcamp(slug: string): Promise<Bootcamp | undefined> {
    try { return toBootcamp(await api<ApiBootcamp>(`/api/bootcamps/${encodeURIComponent(slug)}`)); }
    catch { return undefined; }
  },

  async createBootcamp(bootcamp: Omit<Bootcamp, "id">): Promise<Bootcamp> {
    const dates = bootcamp.sessions.map((s) => sessionDateInput(s.date));
    if (dates.some((date) => !date)) throw new Error("Enter a valid date for every session.");
    const at = (session: Bootcamp["sessions"][number]) => {
      const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(session.time);
      if (!match) throw new Error("Use a time such as 7:00 PM for every session.");
      const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
      return new Date(`${sessionDateInput(session.date)}T${String(hour).padStart(2, "0")}:${match[2]}:00+05:30`).toISOString();
    };
    const times = bootcamp.sessions.map(at);
    const created = await api<ApiBootcamp>("/api/instructor/bootcamps", { method: "POST", ...jsonBody({
      title: bootcamp.title, slug: bootcamp.slug, description: bootcamp.description,
      startDate: times[0], endDate: times[times.length - 1],
    }) });
    for (const [index, session] of bootcamp.sessions.entries()) {
      await api(`/api/instructor/bootcamps/${created.id}/sessions`, { method: "POST", ...jsonBody({
        title: session.title, description: session.description, durationMinutes: session.duration,
        assignmentTitle: session.assignmentTitle || null, sessionDate: times[index], liveClassId: session.liveClassId || null,
      }) });
    }
    const published = await api<ApiBootcamp>(`/api/instructor/bootcamps/${created.id}`, {
      method: "PATCH", ...jsonBody({ status: "published" }),
    });
    return toBootcamp(published);
  },
  async getInstructorBootcamps(): Promise<Bootcamp[]> {
    return (await api<ApiBootcamp[]>("/api/instructor/bootcamps")).map(toBootcamp);
  },
  async getBootcampRegistration(slug: string): Promise<boolean> {
    return (await api<{ registered: boolean }>(`/api/bootcamps/${encodeURIComponent(slug)}/register`)).registered;
  },
  async toggleBootcampRegistration(slug: string): Promise<boolean> {
    const path = `/api/bootcamps/${encodeURIComponent(slug)}/register`;
    const registered = await this.getBootcampRegistration(slug);
    await api(path, { method: registered ? "DELETE" : "POST" });
    return !registered;
  },

  // Events
  async getEvents(): Promise<LiveEvent[]> {
    return (await api<ApiEvent[]>("/api/events")).map(toEvent);
  },

  async getEvent(slug: string): Promise<LiveEvent | undefined> {
    try {
      const event = toEvent(await api<ApiEvent>(`/api/events/${encodeURIComponent(slug)}`));
      try { event.isRegistered = (await api<{ registered: boolean }>(`/api/events/${encodeURIComponent(event.slug)}/register`)).registered; }
      catch { /* Public event detail remains available without a session. */ }
      return event;
    } catch { return undefined; }
  },

  async toggleEventRegistration(slug: string): Promise<boolean> {
    const path = `/api/events/${encodeURIComponent(slug)}/register`;
    const current = await api<{ registered: boolean }>(path);
    if (current.registered) {
      await api(path, { method: "DELETE" });
      return false;
    }
    await api(path, { method: "POST" });
    return true;
  },

  // Participants
  async getParticipants(): Promise<Participant[]> {
    return [...participantsStore];
  },

  async toggleHandRaise(userId = "usr_001"): Promise<boolean> {
    const participant = participantsStore.find((p) => p.id === userId);
    if (participant) {
      participant.isHandRaised = !participant.isHandRaised;
      return participant.isHandRaised;
    }
    return false;
  },

  async muteParticipant(id: string): Promise<void> {
    const participant = participantsStore.find((p) => p.id === id);
    if (participant) {
      participant.isAudioMuted = true;
    }
  },

  async removeParticipant(id: string): Promise<void> {
    participantsStore = participantsStore.filter((p) => p.id !== id);
  },

  async pinParticipant(id: string): Promise<boolean> {
    const participant = participantsStore.find((p) => p.id === id);
    if (participant) {
      participant.isPinned = !participant.isPinned;
      return participant.isPinned;
    }
    return false;
  },

  // Chat Messages
  async getChatMessages(): Promise<LiveChatMessage[]> {
    return [...chatMessagesStore];
  },

  async sendChatMessage(message: Omit<LiveChatMessage, "id" | "timestamp">): Promise<LiveChatMessage> {
    const date = new Date();
    const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const newMsg: LiveChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: timeStr,
    };
    chatMessagesStore = [...chatMessagesStore, newMsg];
    return newMsg;
  },

  // Q&A
  async getQuestions(): Promise<LiveQuestion[]> {
    return [...questionsStore];
  },

  async askQuestion(questionText: string, authorName = "Learner"): Promise<LiveQuestion> {
    const date = new Date();
    const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const newQ: LiveQuestion = {
      id: `qa-${Date.now()}`,
      authorName,
      authorAvatar: "/images/first-version/photo-1535713875002-d1d0cf377fde.jpg",
      question: questionText,
      timestamp: timeStr,
      upvotes: 1,
      isAnswered: false,
    };
    questionsStore = [newQ, ...questionsStore];
    return newQ;
  },

  async upvoteQuestion(id: string): Promise<number> {
    const q = questionsStore.find((item) => item.id === id);
    if (q) {
      q.upvotes += 1;
      return q.upvotes;
    }
    return 0;
  },

  async answerQuestion(id: string, answerText: string, answeredBy = "John Doe"): Promise<void> {
    const q = questionsStore.find((item) => item.id === id);
    if (q) {
      q.isAnswered = true;
      q.answerText = answerText;
      q.answeredBy = answeredBy;
    }
  },

  // Polls
  async getPolls(): Promise<LivePoll[]> {
    return [...pollsStore];
  },

  async createPoll(question: string, optionTexts: string[]): Promise<LivePoll> {
    const newPoll: LivePoll = {
      id: `poll-${Date.now()}`,
      question,
      options: optionTexts.map((text, idx) => ({
        id: `opt-${idx + 1}`,
        text,
        votes: 0,
      })),
      totalVotes: 0,
      status: "active",
    };
    pollsStore = [newPoll, ...pollsStore];
    return newPoll;
  },

  async votePoll(pollId: string, optionId: string): Promise<LivePoll | undefined> {
    const poll = pollsStore.find((p) => p.id === pollId);
    if (poll && !poll.userVotedOptionId) {
      const option = poll.options.find((o) => o.id === optionId);
      if (option) {
        option.votes += 1;
        poll.totalVotes += 1;
        poll.userVotedOptionId = optionId;
      }
    }
    return poll;
  },

  // Resources
  async getResources(): Promise<LiveResource[]> {
    return [...resourcesStore];
  },

  async addResource(resource: Omit<LiveResource, "id" | "addedAt">): Promise<LiveResource> {
    const newRes: LiveResource = {
      ...resource,
      id: `res-${Date.now()}`,
      addedAt: "Just now",
    };
    resourcesStore = [newRes, ...resourcesStore];
    return newRes;
  },
};
