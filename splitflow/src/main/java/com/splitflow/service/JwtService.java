package com.splitflow.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final String secret;

    public JwtService(
            @Value("${jwt.secret}") String secret) {

        this.secret = secret;
    }

    private SecretKey getSigningKey() {

        return Keys.hmacShaKeyFor(
                secret.getBytes(
                        StandardCharsets.UTF_8));
    }

    public String generateToken(
            String email) {

        long expirationTime = 1000L
                * 60
                * 60
                * 24;

        return Jwts.builder()
                .subject(email)
                .issuedAt(
                        new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + expirationTime))
                .signWith(
                        getSigningKey())
                .compact();
    }

    public String extractEmail(
            String token) {

        return Jwts.parser()
                .verifyWith(
                        getSigningKey())
                .build()
                .parseSignedClaims(
                        token)
                .getPayload()
                .getSubject();
    }
}