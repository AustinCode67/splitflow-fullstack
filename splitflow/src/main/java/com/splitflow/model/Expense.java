package com.splitflow.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;

    private String description;

    private BigDecimal amount;

    private String paidByEmail;

    private String category;

    public Expense() {
    }

    public Expense(
            Long groupId,
            String description,
            BigDecimal amount,
            String paidByEmail,
            String category) {

        this.groupId = groupId;
        this.description = description;
        this.amount = amount;
        this.paidByEmail = paidByEmail;
        this.category = category;
    }

    public Long getId() {
        return id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getPaidByEmail() {
        return paidByEmail;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}