package com.splitflow.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long groupId;

    private String fromUser;

    private String toUser;

    private BigDecimal amount;

    private LocalDateTime paidAt;

    public Payment() {
    }

    public Payment(
            Long groupId,
            String fromUser,
            String toUser,
            BigDecimal amount) {

        this.groupId = groupId;
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.amount = amount;
        this.paidAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getGroupId() {
        return groupId;
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

    public LocalDateTime getPaidAt() {
        return paidAt;
    }
}