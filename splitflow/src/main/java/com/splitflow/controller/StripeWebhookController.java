package com.splitflow.controller;

import com.splitflow.service.UserService;

import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.SignatureVerificationException;

import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;

import com.stripe.net.Webhook;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/payments")
public class StripeWebhookController {

    private final UserService userService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    public StripeWebhookController(
            UserService userService) {
        this.userService = userService;
    }

    // =========================================================
    // HELPER: DESERIALIZE STRIPE EVENT
    // =========================================================

    private StripeObject getStripeObject(
            Event event) {

        StripeObject stripeObject = event
                .getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (stripeObject != null) {
            return stripeObject;
        }

        try {

            return event
                    .getDataObjectDeserializer()
                    .deserializeUnsafe();

        } catch (EventDataObjectDeserializationException exception) {

            System.out.println(
                    "Stripe event deserialization failed: "
                            + exception.getMessage());

            return null;
        }
    }

    // =========================================================
    // WEBHOOK
    // =========================================================

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestBody String payload,

            @RequestHeader(value = "Stripe-Signature", required = false) String signatureHeader) {

        if (signatureHeader == null ||
                signatureHeader.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Missing Stripe signature."));
        }

        Event event;

        try {

            event = Webhook.constructEvent(
                    payload,
                    signatureHeader,
                    webhookSecret);

        } catch (SignatureVerificationException exception) {

            System.out.println(
                    "Stripe webhook signature failed.");

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid Stripe signature."));
        }

        System.out.println(
                "Stripe event received: "
                        + event.getType());

        // =====================================================
        // CHECKOUT COMPLETED
        // =====================================================

        if ("checkout.session.completed"
                .equals(
                        event.getType())) {

            StripeObject stripeObject = getStripeObject(
                    event);

            if (stripeObject instanceof Session session) {

                String userEmail = session
                        .getClientReferenceId();

                if ((userEmail == null ||
                        userEmail.isBlank()) &&
                        session
                                .getCustomerDetails() != null) {

                    userEmail = session
                            .getCustomerDetails()
                            .getEmail();
                }

                String customerId = session.getCustomer();

                String subscriptionId = session.getSubscription();

                System.out.println(
                        "Stripe checkout email: "
                                + userEmail);

                System.out.println(
                        "Stripe customer: "
                                + customerId);

                System.out.println(
                        "Stripe subscription: "
                                + subscriptionId);

                if (userEmail != null &&
                        !userEmail.isBlank()) {

                    userService.activatePlus(
                            userEmail,
                            customerId,
                            subscriptionId);

                    System.out.println(
                            "SplitFlow PLUS activated for: "
                                    + userEmail);

                } else {

                    System.out.println(
                            "Could not determine user email from Stripe session.");
                }

            } else {

                System.out.println(
                        "Stripe checkout session could not be deserialized.");
            }
        }

        // =====================================================
        // SUBSCRIPTION CANCELLED
        // =====================================================

        if ("customer.subscription.deleted"
                .equals(
                        event.getType())) {

            StripeObject stripeObject = getStripeObject(
                    event);

            if (stripeObject instanceof Subscription subscription) {

                String customerId = subscription
                        .getCustomer();

                System.out.println(
                        "Stripe subscription cancelled for customer: "
                                + customerId);

                userService
                        .deactivatePlusByCustomerId(
                                customerId);

            } else {

                System.out.println(
                        "Stripe subscription could not be deserialized.");
            }
        }

        return ResponseEntity.ok(
                Map.of(
                        "received",
                        true));
    }
}