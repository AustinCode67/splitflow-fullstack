package com.splitflow.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ReceiptScanResult {

    private String merchant;
    private String date;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal serviceCharge;
    private BigDecimal total;
    private String category;

    private List<ReceiptItem> items = new ArrayList<>();

    public ReceiptScanResult() {
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(String merchant) {
        this.merchant = merchant;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getServiceCharge() {
        return serviceCharge;
    }

    public void setServiceCharge(
            BigDecimal serviceCharge) {
        this.serviceCharge = serviceCharge;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<ReceiptItem> getItems() {
        return items;
    }

    public void setItems(
            List<ReceiptItem> items) {
        this.items = items;
    }
}