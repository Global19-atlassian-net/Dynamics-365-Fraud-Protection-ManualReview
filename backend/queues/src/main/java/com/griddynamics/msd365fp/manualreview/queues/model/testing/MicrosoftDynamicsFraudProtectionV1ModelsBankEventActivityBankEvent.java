/*
 * Knowledge Gateway Service
 * This API allows merchants using Microsoft Dynamics 365 Fraud Protection to send events for risk evaluation. These events are used to build up information about the purchases the customers are making and provide merchants with a recommendation to approve or reject transactions due to Fraud. For integration and testing, please use the https://api.dfp.microsoft-int.com/ endpoint. For Production, please use https://api.dfp.microsoft.com/.
 *
 * OpenAPI spec version: v1.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

package com.griddynamics.msd365fp.manualreview.queues.model.testing;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.OffsetDateTime;
import java.util.Objects;

/**
 * Bank event payload
 */
@Schema(description = "Bank event payload")
@Builder
@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.JavaClientCodegen", date = "2019-11-14T20:07:05.300728+04:00[Europe/Saratov]")
public class MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent {
  @JsonProperty("bankEventId")
  private String bankEventId;

  @JsonProperty("type")
  private String type;

  @JsonProperty("bankEventTimestamp")
  private OffsetDateTime bankEventTimestamp;

  @JsonProperty("status")
  private String status;

  @JsonProperty("bankResponseCode")
  private String bankResponseCode;

  @JsonProperty("paymentProcessor")
  private String paymentProcessor;

  @JsonProperty("mrn")
  private String mrn;

  @JsonProperty("mid")
  private String mid;

  @JsonProperty("purchaseId")
  private String purchaseId;

  @JsonProperty("_metadata")
  private MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityMetadata _metadata;

  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent bankEventId(String bankEventId) {
    this.bankEventId = bankEventId;
    return this;
  }

   /**
   * A unique string identifying this Bank Event
   * @return bankEventId
  **/
  @Schema(required = true, description = "A unique string identifying this Bank Event")
  public String getBankEventId() {
    return bankEventId;
  }

  public void setBankEventId(String bankEventId) {
    this.bankEventId = bankEventId;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent type(String type) {
    this.type = type;
    return this;
  }

   /**
   * Bank Event Type. Possible values &#x27;Auth&#x27; | &#x27;AuthCancel&#x27; | &#x27;ChargeReversal&#x27; | &#x27;Charge&#x27;
   * @return type
  **/
  @Schema(required = true, description = "Bank Event Type. Possible values 'Auth' | 'AuthCancel' | 'ChargeReversal' | 'Charge'")
  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent bankEventTimestamp(OffsetDateTime bankEventTimestamp) {
    this.bankEventTimestamp = bankEventTimestamp;
    return this;
  }

   /**
   * Timestamp from Bank
   * @return bankEventTimestamp
  **/
  @Schema(description = "Timestamp from Bank")
  public OffsetDateTime getBankEventTimestamp() {
    return bankEventTimestamp;
  }

  public void setBankEventTimestamp(OffsetDateTime bankEventTimestamp) {
    this.bankEventTimestamp = bankEventTimestamp;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent status(String status) {
    this.status = status;
    return this;
  }

   /**
   * Possible values &#x27;Approved&#x27; | &#x27;Unknown&#x27; | &#x27;Declined&#x27;
   * @return status
  **/
  @Schema(description = "Possible values 'Approved' | 'Unknown' | 'Declined'")
  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent bankResponseCode(String bankResponseCode) {
    this.bankResponseCode = bankResponseCode;
    return this;
  }

   /**
   * Bank code on response
   * @return bankResponseCode
  **/
  @Schema(description = "Bank code on response")
  public String getBankResponseCode() {
    return bankResponseCode;
  }

  public void setBankResponseCode(String bankResponseCode) {
    this.bankResponseCode = bankResponseCode;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent paymentProcessor(String paymentProcessor) {
    this.paymentProcessor = paymentProcessor;
    return this;
  }

   /**
   * Processor name. Possible values &#x27;FDC&#x27; | &#x27;Adyen&#x27; | &#x27;TSYS&#x27; | &#x27;WorldPay&#x27; | &#x27;Chase&#x27; | &#x27;Stripe&#x27; | &#x27;PayPal&#x27;
   * @return paymentProcessor
  **/
  @Schema(description = "Processor name. Possible values 'FDC' | 'Adyen' | 'TSYS' | 'WorldPay' | 'Chase' | 'Stripe' | 'PayPal'")
  public String getPaymentProcessor() {
    return paymentProcessor;
  }

  public void setPaymentProcessor(String paymentProcessor) {
    this.paymentProcessor = paymentProcessor;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent mrn(String mrn) {
    this.mrn = mrn;
    return this;
  }

   /**
   * Merchant Reference Number, used to identify the transaction from the merchant side
   * @return mrn
  **/
  @Schema(description = "Merchant Reference Number, used to identify the transaction from the merchant side")
  public String getMrn() {
    return mrn;
  }

  public void setMrn(String mrn) {
    this.mrn = mrn;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent mid(String mid) {
    this.mid = mid;
    return this;
  }

   /**
   * N/A
   * @return mid
  **/
  @Schema(description = "N/A")
  public String getMid() {
    return mid;
  }

  public void setMid(String mid) {
    this.mid = mid;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent purchaseId(String purchaseId) {
    this.purchaseId = purchaseId;
    return this;
  }

   /**
   * A unique string identifying the purchase
   * @return purchaseId
  **/
  @Schema(required = true, description = "A unique string identifying the purchase")
  public String getPurchaseId() {
    return purchaseId;
  }

  public void setPurchaseId(String purchaseId) {
    this.purchaseId = purchaseId;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent _metadata(MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityMetadata _metadata) {
    this._metadata = _metadata;
    return this;
  }

   /**
   * Get _metadata
   * @return _metadata
  **/
  @Schema(required = true, description = "")
  public MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityMetadata get_metadata() {
    return _metadata;
  }

  public void setMetadata(MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityMetadata _metadata) {
    this._metadata = _metadata;
  }


  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent = (MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent) o;
    return Objects.equals(this.bankEventId, microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent.bankEventId) &&
        Objects.equals(this.type, microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent.type) &&
        Objects.equals(this.bankEventTimestamp, microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent.bankEventTimestamp) &&
        Objects.equals(this.status, microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent.status) &&
        Objects.equals(this.bankResponseCode, microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent.bankResponseCode) &&
        Objects.equals(this.paymentProcessor, microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent.paymentProcessor) &&
        Objects.equals(this.mrn, microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent.mrn) &&
        Objects.equals(this.mid, microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent.mid) &&
        Objects.equals(this.purchaseId, microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent.purchaseId) &&
        Objects.equals(this._metadata, microsoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent._metadata);
  }

  @Override
  public int hashCode() {
    return Objects.hash(bankEventId, type, bankEventTimestamp, status, bankResponseCode, paymentProcessor, mrn, mid, purchaseId, _metadata);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class MicrosoftDynamicsFraudProtectionV1ModelsBankEventActivityBankEvent {\n");
    
    sb.append("    bankEventId: ").append(toIndentedString(bankEventId)).append("\n");
    sb.append("    type: ").append(toIndentedString(type)).append("\n");
    sb.append("    bankEventTimestamp: ").append(toIndentedString(bankEventTimestamp)).append("\n");
    sb.append("    status: ").append(toIndentedString(status)).append("\n");
    sb.append("    bankResponseCode: ").append(toIndentedString(bankResponseCode)).append("\n");
    sb.append("    paymentProcessor: ").append(toIndentedString(paymentProcessor)).append("\n");
    sb.append("    mrn: ").append(toIndentedString(mrn)).append("\n");
    sb.append("    mid: ").append(toIndentedString(mid)).append("\n");
    sb.append("    purchaseId: ").append(toIndentedString(purchaseId)).append("\n");
    sb.append("    _metadata: ").append(toIndentedString(_metadata)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }

}
