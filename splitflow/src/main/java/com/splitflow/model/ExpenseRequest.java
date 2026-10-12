package com.splitflow.model;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ExpenseRequest {

    private String description;
    private BigDecimal amount;
    private String paidByEmail;
    private List<String> participants;
    private String splitType;
    private Map<String, BigDecimal> splitValues;
    private String category;

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getPaidByEmail() {
        return paidByEmail;
    }

    public List<String> getParticipants() {
        return participants;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public void setPaidByEmail(String paidByEmail) {
        this.paidByEmail = paidByEmail;
    }

    public void setParticipants(List<String> participants) {
        this.participants = participants;
    }

    public String getSplitType() {
        return splitType;
    }

    public void setSplitType(String splitType) {
        this.splitType = splitType;
    }

    public Map<String, BigDecimal> getSplitValues() {
        return splitValues;
    }

    public void setSplitValues(Map<String, BigDecimal> splitValues) {
        this.splitValues = splitValues;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}