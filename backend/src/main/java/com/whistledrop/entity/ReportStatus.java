package com.whistledrop.entity;

public enum ReportStatus {
    SUBMITTED,
    UNDER_REVIEW,
    RESOLVED,
    DISMISSED;

    /**
     * Validates if transition from this status to next status is permitted.
     * Allowed transitions:
     * - SUBMITTED -> UNDER_REVIEW, DISMISSED
     * - UNDER_REVIEW -> RESOLVED, DISMISSED, UNDER_REVIEW (adding progress notes)
     * - RESOLVED -> UNDER_REVIEW (re-opening for further investigation if needed)
     * - DISMISSED -> UNDER_REVIEW (re-evaluating dismissed report)
     */
    public boolean canTransitionTo(ReportStatus nextStatus) {
        if (nextStatus == null) {
            return false;
        }
        if (this == nextStatus) {
            // Allow adding comments/notes under the same status (e.g. UNDER_REVIEW updates)
            return true;
        }
        return switch (this) {
            case SUBMITTED -> nextStatus == UNDER_REVIEW || nextStatus == DISMISSED;
            case UNDER_REVIEW -> nextStatus == RESOLVED || nextStatus == DISMISSED;
            case RESOLVED -> nextStatus == UNDER_REVIEW;
            case DISMISSED -> nextStatus == UNDER_REVIEW;
        };
    }
}
