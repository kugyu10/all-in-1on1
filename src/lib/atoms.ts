import { atom } from "jotai";

export interface User {
  _id: string;
  name: string;
  email: string;
  googleId?: string;
  profileImage?: string;
  isOwner: boolean;
  createdAt: number;
}

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  ownerId: string;
  duration: number;
  availableSlots: {
    startTime: number;
    endTime: number;
    isAvailable: boolean;
  }[];
  meetingType: "zoom" | "google_meet";
  isActive: boolean;
  createdAt: number;
}

export interface Booking {
  _id: string;
  meetingId: string;
  attendeeEmail: string;
  attendeeName: string;
  scheduledTime: number;
  status: "scheduled" | "cancelled" | "completed";
  meetingLink?: string;
  createdAt: number;
}

export const userAtom = atom<User | null>(null);
export const meetingsAtom = atom<Meeting[]>([]);
export const bookingsAtom = atom<Booking[]>([]);
export const selectedMeetingAtom = atom<Meeting | null>(null);
export const selectedTimeSlotAtom = atom<number | null>(null);