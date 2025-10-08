// Helper to format date and calculate age
const formatDateAndAge = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString.replace(/-/g, '/'));
    if (isNaN(date)) return 'Invalid Date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--;
    }
    return `${formattedDate} (${age})`;
};
export default formatDateAndAge;
