"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Download } from "lucide-react";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const calendarDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function calendarTime(date: Date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}00`;
}

function calendarText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function LearningScheduleCard({ courseId, courseSlug, courseTitle, userId }: {
  courseId: string; courseSlug: string; courseTitle: string; userId: string;
}) {
  const storageKey = `elevate:study-prompt:${userId}:${courseId}`;
  const [dismissed, setDismissed] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [day, setDay] = useState(1);
  const [time, setTime] = useState("19:00");
  const [minutes, setMinutes] = useState(30);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => { setDismissed(window.localStorage.getItem(storageKey) === "dismissed"); }, [storageKey]);

  function dismiss() {
    window.localStorage.setItem(storageKey, "dismissed");
    setDismissed(true);
  }

  function downloadCalendar() {
    const [hour, minute] = time.split(":").map(Number);
    if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour > 23 || minute > 59) return;
    const start = new Date();
    start.setHours(hour, minute, 0, 0);
    start.setDate(start.getDate() + (day - start.getDay() + 7) % 7);
    if (start.getTime() <= Date.now()) start.setDate(start.getDate() + 7);
    const end = new Date(start.getTime() + minutes * 60000);
    const courseUrl = new URL(`/courses/${courseSlug}`, window.location.origin).toString();
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Elevate//Learning Schedule//EN",
      "BEGIN:VEVENT", `UID:${crypto.randomUUID()}@elevate-learning`, `DTSTAMP:${stamp}`,
      `DTSTART:${calendarTime(start)}`, `DTEND:${calendarTime(end)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${calendarDays[day]}`,
      `SUMMARY:${calendarText(`Study ${courseTitle}`)}`,
      `DESCRIPTION:${calendarText(`Continue learning on Elevate: ${courseUrl}`)}`,
      `URL:${courseUrl}`, "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `elevate-${courseSlug}-study.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloaded(true);
  }

  if (dismissed) return null;
  return <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-white p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3"><span className="rounded-xl bg-white p-2.5 text-[#E85D2A] shadow-sm"><CalendarDays className="h-5 w-5" /></span><div>
        <h4 className="font-bold text-[#172033]">Make room for learning</h4>
        <p className="mt-1 max-w-xl text-sm text-[#64748B]">Pick a weekly study time and add it to your calendar. Your calendar app can send the reminders.</p>
      </div></div>
      <button type="button" onClick={dismiss} className="text-xs font-semibold text-[#64748B] hover:text-[#172033]">Dismiss</button>
    </div>
    {!planning ? <button type="button" onClick={() => setPlanning(true)} className="mt-5 rounded-lg bg-[#172033] px-4 py-2.5 text-sm font-bold text-white">Plan a study session</button> :
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div><label htmlFor="study-day" className="block text-xs font-semibold text-[#172033]">Day</label><select id="study-day" value={day} onChange={(event) => setDay(Number(event.target.value))} className="mt-1 block rounded-lg border border-[#CBD5E1] bg-white p-2.5 text-sm">{days.map((name, index) => <option key={name} value={index}>{name}</option>)}</select></div>
        <div><label htmlFor="study-time" className="block text-xs font-semibold text-[#172033]">Time</label><input id="study-time" type="time" required value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 block rounded-lg border border-[#CBD5E1] bg-white p-2.5 text-sm" /></div>
        <div><label htmlFor="study-minutes" className="block text-xs font-semibold text-[#172033]">Minutes</label><select id="study-minutes" value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} className="mt-1 block rounded-lg border border-[#CBD5E1] bg-white p-2.5 text-sm"><option value={15}>15</option><option value={30}>30</option><option value={45}>45</option><option value={60}>60</option></select></div>
        <button type="button" onClick={downloadCalendar} className="inline-flex items-center gap-2 rounded-lg bg-[#FF6B35] px-4 py-2.5 text-sm font-bold text-white"><Download className="h-4 w-4" />Add to calendar</button>
      </div>}
    {planning && <p className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B]"><Clock3 className="h-3.5 w-3.5" />{downloaded ? "Calendar file downloaded. Open it to add the recurring reminder." : "A recurring calendar file will download for you to import."}</p>}
  </div>;
}
