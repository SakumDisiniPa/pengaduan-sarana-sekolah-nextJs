import { pb } from "@/lib/pocketbase";
import { Complaint } from "../types";

export const transformComplaint = (raw: Record<string, unknown>): Complaint => {
  const r = raw as Record<string, unknown> & { id: string; photo?: string | string[]; completion_proof?: string | string[] };
  return {
    id: raw.id as string,
    title: raw.title as string,
    description: raw.description as string,
    status: (raw.status as string) || "menunggu",
    categories: Array.isArray(raw.categories) ? raw.categories[0] : (raw.categories as string),
    priority: raw.priority as string,
    created: raw.created as string,
    deadline: raw.deadline as string,
    feedback: raw.feedback as string,
    creator: raw.creator as string,
    location: raw.location as string,
    photo: r.photo
      ? pb.files.getURL(r as unknown as { [key: string]: unknown; id: string; collectionId: string; collectionName: string }, Array.isArray(r.photo) ? r.photo[0] : (r.photo as string))
      : undefined,
    completion_proof: r.completion_proof
      ? pb.files.getURL(r as unknown as { [key: string]: unknown; id: string; collectionId: string; collectionName: string }, Array.isArray(r.completion_proof) ? r.completion_proof[0] : (r.completion_proof as string))
      : undefined,
    rating: raw.rating as number | undefined,
    feedback_message: raw.feedback_message as string | undefined,
    admin_reply: raw.admin_reply as string | undefined,
    expand: raw.expand as Complaint["expand"],
  };
};

export const transformComplaints = (rawList: Record<string, unknown>[]): Complaint[] => {
  return rawList.map(transformComplaint);
};
