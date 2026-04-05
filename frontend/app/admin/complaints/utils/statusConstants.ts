export type StatusConfig = {
  value: string;
  label: string;
  color: string;
};

export const COMPLAINT_STATUSES: StatusConfig[] = [
  {
    value: "menunggu",
    label: "Menunggu",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  },
  {
    value: "diproses",
    label: "Diproses",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  {
    value: "selesai",
    label: "Selesai",
    color: "text-green-400 bg-green-400/10 border-green-400/20",
  },
];

export const getStatusConfig = (status: string): StatusConfig =>
  COMPLAINT_STATUSES.find((s) => s.value === status) || COMPLAINT_STATUSES[0];
