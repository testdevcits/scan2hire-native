  // Human-readable format conversion: e.g., 273 minutes -> 4h 33m
  export const formatMinutes = (totalMinutes?: number): string => {
    if (!totalMinutes || totalMinutes <= 0) return '0m';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };