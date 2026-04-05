export const handleAvatarFileChange = (
  e: React.ChangeEvent<HTMLInputElement>
): { file: File; preview: string } | null => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file);
    return { file, preview };
  }
  return null;
};

export const getInitialLetter = (name?: string): string => {
  return name?.charAt(0).toUpperCase() || "U";
};
