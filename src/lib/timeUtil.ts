  export const localToUTC = (date: string, time: string): string => {
  // Combine as local datetime
  const localDate = new Date(`${date}T${time}`);

  // Convert to UTC ISO without milliseconds
  return localDate.toISOString().replace(/\.\d{3}Z$/, "Z");
};
