export const formatDate = (dateString?: string): string => {
  if (!dateString) return '--/--/----';

  // Format YYYY-MM-DD to DD/MM/YYYY
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  // Try to parse ISO date
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {
    // Ignore error
  }

  return dateString;
};
