import { DNF, DNF_DISPLAY_VALUE, DNS, DNS_DISPLAY_VALUE } from "../constants";

// transfors the input attempt in milliseconds to a readable format 'MM:SS.ms'
export const toDelimitedString = (resultMs: number) => {
    if (resultMs === DNF) return DNF_DISPLAY_VALUE;
    if (resultMs === DNS) return DNS_DISPLAY_VALUE;

    const minutes = Math.floor(resultMs / 6000);
    const seconds = Math.floor((resultMs - 6000 * minutes) / 100);
    const milliseconds = resultMs - 6000 * minutes - seconds * 100;

    return `${minutes > 0 ? minutes + ':' : ''}${seconds}.${milliseconds < 10 ? '0' + milliseconds : milliseconds}`;
}

// transorms the input attempt string to milliseconds
export const toMilliseconds = (resultRaw: string | null) => {
    if (!resultRaw) return 0;

    if (resultRaw === DNF_DISPLAY_VALUE) return DNF;
    if (resultRaw === DNS_DISPLAY_VALUE) return DNS;

    const milliseconds: number = +resultRaw.split('.')[1];

    const minutesAndSeconds = resultRaw.split('.')[0];
    let seconds: number;
    let minutes = 0;

    if (minutesAndSeconds.indexOf(':') === -1) {
        seconds = +minutesAndSeconds;
    } else {
        minutes = +minutesAndSeconds.split(':')[0];
        seconds = +minutesAndSeconds.split(':')[1];
    }

    return minutes * 6000 + seconds * 100 + milliseconds;
}

export const getBestAndAverage = (attempts: number[]) => {
    const best = attempts.every(a => a === DNF || a === DNS) 
        ? attempts[0]
        : attempts.filter(a => a !== DNF && a !== DNS).sort((a, b) => a - b)[0];

    // if all attempts are DNF/DNS or there are 2 DNF's, don't calculate average
    if (best < 0 || attempts.filter(a => a === DNF || a === DNS).length > 1) 
        return [best, DNF];

    const withoutBest: number[] = attempts.filter((_, i) => i !== attempts.indexOf(best));

    const dnfOrDns =  withoutBest.find(a => a === DNF || a === DNS);
    let worst = dnfOrDns ? dnfOrDns : withoutBest.reduce((prev, cur) => cur > prev ? cur : prev, withoutBest[0]);

    const withoutBestAndWorst: number[] = withoutBest.filter((_, i) => i !== withoutBest.indexOf(worst));

    const avg = Math.floor(withoutBestAndWorst.reduce((prev, cur) => prev + cur, 0) / 3);
    
    return [best, avg];
}