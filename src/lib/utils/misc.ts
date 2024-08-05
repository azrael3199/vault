export const getFormattedDate = (date: string) => {
  const day = new Date(date).getDate().toString().padStart(2, "0").slice(0, 2);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[new Date(date).getMonth()];
  const year = new Date(date).getFullYear().toString().slice(2, 4);
  const formattedDate = `${day} ${month} ${year}`;

  return formattedDate;
};
