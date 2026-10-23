package com.splitflow.controller;

import com.splitflow.model.ReceiptScanResult;
import com.splitflow.service.ReceiptScanService;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/receipts")
public class ReceiptScanController {

    private final ReceiptScanService receiptScanService;

    public ReceiptScanController(
            ReceiptScanService receiptScanService) {

        this.receiptScanService = receiptScanService;
    }

    @PostMapping("/scan")
    public ResponseEntity<ReceiptScanResult> scanReceipt(
            @RequestParam("file") MultipartFile file) {

        ReceiptScanResult result = receiptScanService
                .scanReceipt(
                        file);

        return ResponseEntity.ok(
                result);
    }
}