export function minmax(num: number, min: number, max: number): number {
    if (num < min) return min;
    if (num > max) return max;
    return num;
}
