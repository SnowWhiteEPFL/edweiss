const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 23) {
        return "23:59";
    }

    return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
};

export default formatTime;
