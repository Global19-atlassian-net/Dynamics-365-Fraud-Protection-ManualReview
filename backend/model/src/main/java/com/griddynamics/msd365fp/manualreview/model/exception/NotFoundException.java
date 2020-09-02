package com.griddynamics.msd365fp.manualreview.model.exception;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class NotFoundException extends Exception {
    public NotFoundException(final String message) {
        super(message);
    }
}
