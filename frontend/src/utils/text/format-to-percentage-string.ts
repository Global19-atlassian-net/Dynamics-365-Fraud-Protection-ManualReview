export function formatMetricToPercentageString(metric: number) {
    if (metric === 0) {
        return 0;
    }

    return `${metric}%`;
}
