import { pb } from "@/lib/pocketbase";
import { Complaint } from "../types";

export const transformComplaint = (raw: any): Complaint => {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    status: raw.status || "menunggu",
    categories: raw.categories,
    priority: raw.priority,
    created: raw.created,
    deadline: raw.deadline,
    feedback: raw.feedback,
    creator: raw.creator,
    location: raw.location,
    photo: raw.photo
      ? pb.files.getURL(raw, Array.isArray(raw.photo) ? raw.photo[0] : raw.photo)
      : undefined,
    rating: raw.rating,
    feedback_message: raw.feedback_message,
    admin_reply: raw.admin_reply,
    expand: raw.expand,
  };
};

export const transformComplaints = (rawList: any[]): Complaint[] => {
  return rawList.map(transformComplaint);
};
