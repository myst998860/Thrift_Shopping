package com.event.dto;

public class EsewaPaymentRequest {
    private String amount;
    private String tax_amount;
    private String total_amount;
    private String transaction_uuid;
    private String product_code;
    private String product_service_charge;
    private String product_delivery_charge;
    private String success_url;
    private String failure_url;
    private String signed_field_names;
    private String signature;
    private Long orderId;
    
    // Constructors
    public EsewaPaymentRequest() {}
    
    public EsewaPaymentRequest(String amount, String totalAmount, String transactionUuid, 
                              String productCode, String successUrl, String failureUrl, 
                              String signature, Long orderId) {
        this.amount = amount;
        this.total_amount = totalAmount;
        this.transaction_uuid = transactionUuid;
        this.product_code = productCode;
        this.success_url = successUrl;
        this.failure_url = failureUrl;
        this.signature = signature;
        this.orderId = orderId;
        this.tax_amount = "0";
        this.product_service_charge = "0";
        this.product_delivery_charge = "0";
        this.signed_field_names = "total_amount,transaction_uuid,product_code";
    }
    
    // Getters and Setters
    public String getAmount() {
        return amount;
    }
    
    public void setAmount(String amount) {
        this.amount = amount;
    }
    
    public String getTax_amount() {
        return tax_amount;
    }
    
    public void setTax_amount(String tax_amount) {
        this.tax_amount = tax_amount;
    }
    
    public String getTotal_amount() {
        return total_amount;
    }
    
    public void setTotal_amount(String total_amount) {
        this.total_amount = total_amount;
    }
    
    public String getTransaction_uuid() {
        return transaction_uuid;
    }
    
    public void setTransaction_uuid(String transaction_uuid) {
        this.transaction_uuid = transaction_uuid;
    }
    
    public String getProduct_code() {
        return product_code;
    }
    
    public void setProduct_code(String product_code) {
        this.product_code = product_code;
    }
    
    public String getProduct_service_charge() {
        return product_service_charge;
    }
    
    public void setProduct_service_charge(String product_service_charge) {
        this.product_service_charge = product_service_charge;
    }
    
    public String getProduct_delivery_charge() {
        return product_delivery_charge;
    }
    
    public void setProduct_delivery_charge(String product_delivery_charge) {
        this.product_delivery_charge = product_delivery_charge;
    }
    
    public String getSuccess_url() {
        return success_url;
    }
    
    public void setSuccess_url(String success_url) {
        this.success_url = success_url;
    }
    
    public String getFailure_url() {
        return failure_url;
    }
    
    public void setFailure_url(String failure_url) {
        this.failure_url = failure_url;
    }
    
    public String getSigned_field_names() {
        return signed_field_names;
    }
    
    public void setSigned_field_names(String signed_field_names) {
        this.signed_field_names = signed_field_names;
    }
    
    public String getSignature() {
        return signature;
    }
    
    public void setSignature(String signature) {
        this.signature = signature;
    }
    
    public Long getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
    
    @Override
    public String toString() {
        return "EsewaPaymentRequest{" +
                "amount='" + amount + '\'' +
                ", total_amount='" + total_amount + '\'' +
                ", transaction_uuid='" + transaction_uuid + '\'' +
                ", product_code='" + product_code + '\'' +
                ", signature='" + signature + '\'' +
                '}';
    }
}