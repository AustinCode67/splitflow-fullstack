package com.splitflow.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "expense_splits")
public class ExpenseSplit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long expenseId;

    private String userEmail;

    private BigDecimal amountOwed;

    public ExpenseSplit() {
    }

    public ExpenseSplit(Long expenseId, String userEmail, BigDecimal amountOwed) {
        this.expenseId = expenseId;
        this.userEmail = userEmail;
        this.amountOwed = amountOwed;
    }

    public Long getId() {
        return id;
    }

    public Long getExpenseId() {
        return expenseId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public BigDecimal getAmountOwed() {
        return amountOwed;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setExpenseId(Long expenseId) {
        this.expenseId = expenseId;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setAmountOwed(BigDecimal amountOwed) {
        this.amountOwed = amountOwed;
    }
}