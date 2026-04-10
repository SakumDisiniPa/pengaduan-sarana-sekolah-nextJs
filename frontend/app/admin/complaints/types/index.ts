export type Complaint = {
  id: string;
  title: string;
  description: string;
  status: string;
  category?: string;
  priority?: string;
  created: string;
  deadline?: string;
  feedback?: string;
  creator?: string | User;
  location?: string;
  photo?: string;
  completion_proof?: string;
  categories?: string;
  expand?: {
    creator?: User;
    categories?: {
      id: string;
      name: string;
    };
  };
  rating?: number;
  feedback_message?: string;
  admin_reply?: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
};

export type FilterMode = "status" | "date" | "month" | "custom";
