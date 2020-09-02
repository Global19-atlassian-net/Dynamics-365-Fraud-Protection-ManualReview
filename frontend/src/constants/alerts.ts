export enum ALERT_METRIC_TYPE {
    APPROVE_ACCURACY = 'APPROVE_ACCURACY',
    APPROVAL_RATE = 'APPROVAL_RATE'
}

export enum ALERT_THRESHOLD_OPERATOR {
    LESS_THAN = 'LESS_THAN',
    GREATER_THAN = 'GREATER_THAN'
}

export enum PERIOD_DURATION_TYPE {
    YEARS = 'years',
    MONTHS = 'months',
    DAYS = 'days',
    HOURS = 'hours',
    MINUTES = 'minutes',
    SECONDS = 'seconds',
    WEEKS = 'weeks'
}

export const ALERT_METRIC_TYPE_DISPLAY = {
    [ALERT_METRIC_TYPE.APPROVE_ACCURACY]: 'Accuracy, %',
    [ALERT_METRIC_TYPE.APPROVAL_RATE]: 'Approval Rate'
};

export const ALERT_THRESHOLD_OPERATOR_DISPLAY = {
    [ALERT_THRESHOLD_OPERATOR.LESS_THAN]: 'Lower than',
    [ALERT_THRESHOLD_OPERATOR.GREATER_THAN]: 'Higher than'
};

export const PERIOD_DURATION_TYPE_DISPLAY = {
    [PERIOD_DURATION_TYPE.YEARS]: 'Years',
    [PERIOD_DURATION_TYPE.MONTHS]: 'Months',
    [PERIOD_DURATION_TYPE.DAYS]: 'Days',
    [PERIOD_DURATION_TYPE.HOURS]: 'Hours',
    [PERIOD_DURATION_TYPE.MINUTES]: 'Minutes',
    [PERIOD_DURATION_TYPE.SECONDS]: 'Seconds',
    [PERIOD_DURATION_TYPE.WEEKS]: 'Weeks',
};

export const PERIOD_DURATION_TYPE_SHORT = {
    [PERIOD_DURATION_TYPE.YEARS]: 'Y',
    [PERIOD_DURATION_TYPE.MONTHS]: 'M',
    [PERIOD_DURATION_TYPE.DAYS]: 'D',
    [PERIOD_DURATION_TYPE.HOURS]: 'H',
    [PERIOD_DURATION_TYPE.MINUTES]: 'M',
    [PERIOD_DURATION_TYPE.SECONDS]: 'S',
    [PERIOD_DURATION_TYPE.WEEKS]: 'W',
};

export enum ALERT_MUTATION_TYPE {
    EDIT = 'edit',
    CREATE = 'create',
    DELETE = 'delete'
}
