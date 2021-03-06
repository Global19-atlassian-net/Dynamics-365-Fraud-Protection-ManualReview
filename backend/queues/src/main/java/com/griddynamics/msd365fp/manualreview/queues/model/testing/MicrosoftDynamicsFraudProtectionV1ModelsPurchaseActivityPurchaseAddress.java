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

import java.util.Objects;

/**
 * N/A
 */
@Schema(description = "N/A")
@Builder
@javax.annotation.Generated(value = "io.swagger.codegen.v3.generators.java.JavaClientCodegen", date = "2019-11-14T20:07:05.300728+04:00[Europe/Saratov]")
public class MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress {
  @JsonProperty("street1")
  private String street1;

  @JsonProperty("street2")
  private String street2;

  @JsonProperty("street3")
  private String street3;

  @JsonProperty("city")
  private String city;

  @JsonProperty("state")
  private String state;

  @JsonProperty("district")
  private String district;

  @JsonProperty("zipCode")
  private String zipCode;

  @JsonProperty("country")
  private String country;

  @JsonProperty("firstName")
  private String firstName;

  @JsonProperty("lastName")
  private String lastName;

  @JsonProperty("phoneNumber")
  private String phoneNumber;

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress street1(String street1) {
    this.street1 = street1;
    return this;
  }

   /**
   * The first row that was provided for the address.
   * @return street1
  **/
  @Schema(description = "The first row that was provided for the address.")
  public String getStreet1() {
    return street1;
  }

  public void setStreet1(String street1) {
    this.street1 = street1;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress street2(String street2) {
    this.street2 = street2;
    return this;
  }

   /**
   * The second row that was provided for the address. (This value can be blank.)
   * @return street2
  **/
  @Schema(description = "The second row that was provided for the address. (This value can be blank.)")
  public String getStreet2() {
    return street2;
  }

  public void setStreet2(String street2) {
    this.street2 = street2;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress street3(String street3) {
    this.street3 = street3;
    return this;
  }

   /**
   * The third row that was provided for the address. (This value can be blank.)
   * @return street3
  **/
  @Schema(description = "The third row that was provided for the address. (This value can be blank.)")
  public String getStreet3() {
    return street3;
  }

  public void setStreet3(String street3) {
    this.street3 = street3;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress city(String city) {
    this.city = city;
    return this;
  }

   /**
   * The city that was provided for the address.
   * @return city
  **/
  @Schema(description = "The city that was provided for the address.")
  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress state(String state) {
    this.state = state;
    return this;
  }

   /**
   * The state or province that was provided for the address.
   * @return state
  **/
  @Schema(description = "The state or province that was provided for the address.")
  public String getState() {
    return state;
  }

  public void setState(String state) {
    this.state = state;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress district(String district) {
    this.district = district;
    return this;
  }

   /**
   * The district that was provided for the address.
   * @return district
  **/
  @Schema(description = "The district that was provided for the address.")
  public String getDistrict() {
    return district;
  }

  public void setDistrict(String district) {
    this.district = district;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress zipCode(String zipCode) {
    this.zipCode = zipCode;
    return this;
  }

   /**
   * The postal code that was provided for the address.
   * @return zipCode
  **/
  @Schema(description = "The postal code that was provided for the address.")
  public String getZipCode() {
    return zipCode;
  }

  public void setZipCode(String zipCode) {
    this.zipCode = zipCode;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress country(String country) {
    this.country = country;
    return this;
  }

   /**
   * The country/region code that was provided for the address. The value should be a two-letter ISO country/region code (for example, US).
   * @return country
  **/
  @Schema(description = "The country/region code that was provided for the address. The value should be a two-letter ISO country/region code (for example, US).")
  public String getCountry() {
    return country;
  }

  public void setCountry(String country) {
    this.country = country;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress firstName(String firstName) {
    this.firstName = firstName;
    return this;
  }

   /**
   * First Name provided with the address
   * @return firstName
  **/
  @Schema(description = "First Name provided with the address")
  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress lastName(String lastName) {
    this.lastName = lastName;
    return this;
  }

   /**
   * Last Name provided with the address
   * @return lastName
  **/
  @Schema(description = "Last Name provided with the address")
  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress phoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
    return this;
  }

   /**
   * Phone Number provided with the address
   * @return phoneNumber
  **/
  @Schema(description = "Phone Number provided with the address")
  public String getPhoneNumber() {
    return phoneNumber;
  }

  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }


  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress = (MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress) o;
    return Objects.equals(this.street1, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.street1) &&
        Objects.equals(this.street2, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.street2) &&
        Objects.equals(this.street3, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.street3) &&
        Objects.equals(this.city, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.city) &&
        Objects.equals(this.state, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.state) &&
        Objects.equals(this.district, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.district) &&
        Objects.equals(this.zipCode, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.zipCode) &&
        Objects.equals(this.country, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.country) &&
        Objects.equals(this.firstName, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.firstName) &&
        Objects.equals(this.lastName, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.lastName) &&
        Objects.equals(this.phoneNumber, microsoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress.phoneNumber);
  }

  @Override
  public int hashCode() {
    return Objects.hash(street1, street2, street3, city, state, district, zipCode, country, firstName, lastName, phoneNumber);
  }


  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class MicrosoftDynamicsFraudProtectionV1ModelsPurchaseActivityPurchaseAddress {\n");
    
    sb.append("    street1: ").append(toIndentedString(street1)).append("\n");
    sb.append("    street2: ").append(toIndentedString(street2)).append("\n");
    sb.append("    street3: ").append(toIndentedString(street3)).append("\n");
    sb.append("    city: ").append(toIndentedString(city)).append("\n");
    sb.append("    state: ").append(toIndentedString(state)).append("\n");
    sb.append("    district: ").append(toIndentedString(district)).append("\n");
    sb.append("    zipCode: ").append(toIndentedString(zipCode)).append("\n");
    sb.append("    country: ").append(toIndentedString(country)).append("\n");
    sb.append("    firstName: ").append(toIndentedString(firstName)).append("\n");
    sb.append("    lastName: ").append(toIndentedString(lastName)).append("\n");
    sb.append("    phoneNumber: ").append(toIndentedString(phoneNumber)).append("\n");
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
