package com.event.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EsewaStatusResponse {
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("transaction_uuid")
    private String transaction_uuid;
    
    @JsonProperty("ref_id")
    private String ref_id;
    
    @JsonProperty("total_amount")
    private String total_amount;
    
    @JsonProperty("product_code")
    private String product_code;
    
    @JsonProperty("transaction_code")
    private String transaction_code;
    
    // Getters and Setters
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getTransaction_uuid() {
        return transaction_uuid;
    }
    
    public void setTransaction_uuid(String transaction_uuid) {
        this.transaction_uuid = transaction_uuid;
    }
    
    public String getRef_id() {
        return ref_id;
    }
    
    public void setRef_id(String ref_id) {
        this.ref_id = ref_id;
    }
    
    public String getTotal_amount() {
        return total_amount;
    }
    
    public void setTotal_amount(String total_amount) {
        this.total_amount = total_amount;
    }
    
    public String getProduct_code() {
        return product_code;
    }
    
    public void setProduct_code(String product_code) {
        this.product_code = product_code;
    }
    
    public String getTransaction_code() {
        return transaction_code;
    }
    
    public void setTransaction_code(String transaction_code) {
        this.transaction_code = transaction_code;
    }
}