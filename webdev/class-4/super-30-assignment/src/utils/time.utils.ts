export function isValidTime(time: string): boolean{
    return /^([01]\d|2[0-3]):(00|30)$/.test(time)
}
export function timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

export function minutesToTime(minutes: number): string{
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`
}

export function addMinutes(time: string, minutes: number): string{
    return minutesToTime(timeToMinutes(time)+minutes)
}
export function rangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
    const a1 = timeToMinutes(startA)
    const a2 = timeToMinutes(endA);
    const b1 = timeToMinutes(startB);
    const b2 = timeToMinutes(endB);
    return a1 < b2 && b1 < a2;
}