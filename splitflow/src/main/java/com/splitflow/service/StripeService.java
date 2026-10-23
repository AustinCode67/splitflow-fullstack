package com.splitflow.service;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.price-plus}")
    private String stripePricePlus;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public String createCheckoutSession(
            String userEmail) throws Exception {

        Stripe.apiKey = stripeSecretKey;

        SessionCreateParams params = SessionCreateParams
                .builder()

                .setMode(
                        SessionCreateParams.Mode.SUBSCRIPTION)

                // Lets us identify the SplitFlow
                // user when Stripe sends the webhook.
                .setClientReferenceId(
                        userEmail)

                .setCustomerEmail(
                        userEmail)

                .setSuccessUrl(
                        frontendUrl +
                                "/?payment=success")

                .setCancelUrl(
                        frontendUrl +
                                "/?payment=cancel")

                .addLineItem(
                        SessionCreateParams.LineItem
                                .builder()
                                .setPrice(
                                        stripePricePlus)
                                .setQuantity(
                                        1L)
                                .build())

                .build();

        Session session = Session.create(
                params);

        return session.getUrl();
    }
}