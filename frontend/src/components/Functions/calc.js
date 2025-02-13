export const calculateTotalPrice = (start, end, pricePerHour) => {
    // Convert time strings to hours and minutes
    let [startHour, startMinute] = start.split(":").map(Number);
    let [endHour, endMinute] = end.split(":").map(Number);
  
    // Convert everything to minutes
    let startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;
  
    // Calculate total hours (assuming same day)
    let totalHours = (endTotalMinutes - startTotalMinutes) / 60;
  
    // Calculate total price
    return totalHours * pricePerHour;
  };