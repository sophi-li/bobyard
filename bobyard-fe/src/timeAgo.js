export function timeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);

    const intervals = [
        { label: 'year', secs: 31536000 },
        { label: 'month', secs: 2592000 },
        { label: 'week', secs: 604800 },
        { label: 'day', secs: 86400 },
        { label: 'hour', secs: 3600 },
        { label: 'minute', secs: 60 },
        { label: 'second', secs: 1 }
    ];

    for (const { label, secs } of intervals) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) {
            return `${count} ${label}${count !== 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}
