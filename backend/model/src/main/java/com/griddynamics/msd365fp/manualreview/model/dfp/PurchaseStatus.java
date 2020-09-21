package com.griddynamics.msd365fp.manualreview.model.dfp;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;

import java.io.Serializable;

@Data
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategy.UpperCamelCaseStrategy.class)
public class PurchaseStatus implements Serializable {
    private String purchaseId;
    private String statusType;
    private String statusDate;
    private String reason;
}