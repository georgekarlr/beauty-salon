 // Helper to get start and end of today
export const getTodaysDateRange = () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return { start_datetime: start.toISOString(), end_datetime: end.toISOString() }
}

export const getCurrentDate = (date = new Date())=> {
     // 2. Get the local date and time parts
     const year = date.getFullYear();
     const month = String(date.getMonth() + 1).padStart(2, '0');
     const day = String(date.getDate()).padStart(2, '0');
     const hours = String(date.getHours()).padStart(2, '0');
     const minutes = String(date.getMinutes()).padStart(2, '0');
     const seconds = String(date.getSeconds()).padStart(2, '0');
     const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

     // 3. Combine them into the final string
     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
 }