package com.splitflow.model;

import java.math.BigDecimal;

public class Settlement {

    private String fromUser;
    private String toUser;
    private BigDecimal amount;

    public Settlement(String fromUser, String toUser, BigDecimal amount) {
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.amount = amount;
    }

    public String getFromUser() {
        return fromUser;
    }

    public String getToUser() {
        return toUser;
    }

    public BigDecimal getAmount() {
        return amount;
    }
}