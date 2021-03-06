// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/**
 * TimeMetricDto - Model, represents time performance metrics
 */
export interface TimeMetricDto {
    notWastedAmount: number;
    notWastedDuration: string;
    wastedAmount: number;
    wastedDuration: string;
    resolutionAmount: number;
    resolutionApplyingDuration: string;
    internalDecisionsAmount: number;
    internalDecisionsApplyingDuration: string;
}
