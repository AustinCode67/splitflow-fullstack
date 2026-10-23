package com.splitflow.service;

import com.splitflow.model.ReceiptItem;
import com.splitflow.model.ReceiptScanResult;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;

import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.List;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ReceiptScanService {

        public ReceiptScanResult scanReceipt(
                        MultipartFile file) {

                try {

                        if (file == null ||
                                        file.isEmpty()) {
                                throw new RuntimeException(
                                                "Please upload a receipt image.");
                        }

                        BufferedImage originalImage = ImageIO.read(
                                        file.getInputStream());

                        if (originalImage == null) {
                                throw new RuntimeException(
                                                "Invalid image file.");
                        }

                        // =================================================
                        // IMAGE PREPROCESSING
                        // =================================================

                        BufferedImage processedImage = preprocessImage(
                                        originalImage);

                        // =================================================
                        // TESSERACT
                        // =================================================

                        ITesseract tesseract = new Tesseract();

                        tesseract.setDatapath(
                                        "C:\\Program Files\\Tesseract-OCR\\tessdata");

                        tesseract.setLanguage(
                                        "eng");

                        // Better for receipt-style text blocks.
                        tesseract.setPageSegMode(
                                        4);

                        String text = tesseract.doOCR(
                                        processedImage);

                        System.out.println(
                                        "========== RECEIPT OCR ==========");

                        System.out.println(
                                        text);

                        System.out.println(
                                        "=================================");

                        ReceiptScanResult result = new ReceiptScanResult();

                        result.setCurrency(
                                        detectCurrency(text));

                        result.setMerchant(
                                        detectMerchant(text));

                        result.setDate(
                                        detectDate(text));

                        result.setSubtotal(
                                        detectSubtotal(
                                                        text));

                        result.setTax(
                                        detectTax(text));

                        result.setServiceCharge(
                                        detectServiceCharge(text));

                        result.setTotal(
                                        detectTotal(text));

                        result.setCategory(
                                        detectCategory(text));

                        result.setItems(
                                        detectItems(text));

                        return result;

                } catch (Exception exception) {

                        exception.printStackTrace();

                        throw new RuntimeException(
                                        "Failed to scan receipt: "
                                                        + exception.getMessage());
                }
        }

        private BigDecimal detectSubtotal(
                        String text) {

                String[] keywords = {
                                "sub-total",
                                "sub total",
                                "subtotal"
                };

                for (String keyword : keywords) {

                        BigDecimal amount = findLastAmountOnLine(
                                        text,
                                        keyword);

                        if (amount.compareTo(
                                        BigDecimal.ZERO) > 0) {

                                return amount;
                        }
                }

                return BigDecimal.ZERO;
        }

        // =========================================================
        // PREPROCESS IMAGE
        // =========================================================

        private BufferedImage preprocessImage(
                        BufferedImage original) {

                // Enlarge image to help OCR.
                int scale = 2;

                int newWidth = original.getWidth()
                                * scale;

                int newHeight = original.getHeight()
                                * scale;

                BufferedImage resized = new BufferedImage(
                                newWidth,
                                newHeight,
                                BufferedImage.TYPE_BYTE_GRAY);

                Graphics2D graphics = resized.createGraphics();

                graphics.setRenderingHint(
                                RenderingHints.KEY_INTERPOLATION,
                                RenderingHints.VALUE_INTERPOLATION_BICUBIC);

                graphics.drawImage(
                                original,
                                0,
                                0,
                                newWidth,
                                newHeight,
                                null);

                graphics.dispose();

                // Convert grayscale pixels into stronger
                // black/white values.
                for (int y = 0; y < resized.getHeight(); y++) {

                        for (int x = 0; x < resized.getWidth(); x++) {

                                int rgb = resized.getRGB(
                                                x,
                                                y);

                                int gray = rgb & 0xFF;

                                // Increase contrast.
                                int threshold = 180;

                                int value = gray < threshold
                                                ? 0
                                                : 255;

                                int newRgb = (255 << 24)
                                                |
                                                (value << 16)
                                                |
                                                (value << 8)
                                                |
                                                value;

                                resized.setRGB(
                                                x,
                                                y,
                                                newRgb);
                        }
                }

                return resized;
        }

        // =========================================================
        // MERCHANT
        // =========================================================

        private String detectMerchant(
                        String text) {

                String[] lines = text.split("\\R");

                // First try common Malaysian company indicators.
                for (String line : lines) {

                        String cleaned = line
                                        .trim()
                                        .replaceAll(
                                                        "\\s+",
                                                        " ");

                        String upper = cleaned.toUpperCase();

                        if (upper.contains("BHD") ||
                                        upper.contains("SDN") ||
                                        upper.contains("ENTERPRISE") ||
                                        upper.contains("TRADING") ||
                                        upper.contains("CO.")) {

                                // Remove company registration number.
                                cleaned = cleaned.replaceAll(
                                                "\\([^)]*\\d+[^)]*\\)$",
                                                "")
                                                .trim();

                                return cleaned;
                        }
                }

                // Fallback.
                for (String line : lines) {

                        String cleaned = line.trim();

                        if (cleaned.length() >= 4 &&
                                        !cleaned.matches(
                                                        ".*\\d{3,}.*")) {

                                return cleaned;
                        }
                }

                return "";
        }

        // =========================================================
        // DATE
        // =========================================================

        private String detectDate(
                        String text) {

                Pattern pattern = Pattern.compile(
                                "(\\d{1,2})[/-](\\d{1,2})[/-](\\d{2,4})");

                Matcher matcher = pattern.matcher(
                                text);

                while (matcher.find()) {

                        String dayText = matcher.group(1);

                        String monthText = matcher.group(2);

                        String yearText = matcher.group(3);

                        int day = Integer.parseInt(
                                        dayText);

                        int month = Integer.parseInt(
                                        monthText);

                        int year = Integer.parseInt(
                                        yearText);

                        // Example OCR mistake:
                        // 95/10/2026 may actually be 05/10/2026
                        if (day > 31 &&
                                        dayText.length() == 2 &&
                                        dayText.charAt(0) == '9') {

                                day = Character.getNumericValue(
                                                dayText.charAt(1));
                        }

                        if (yearText.length() == 2) {
                                year += 2000;
                        }

                        if (day >= 1 &&
                                        day <= 31 &&
                                        month >= 1 &&
                                        month <= 12) {

                                return String.format(
                                                "%04d-%02d-%02d",
                                                year,
                                                month,
                                                day);
                        }
                }

                return "";
        }

        // =========================================================
        // CURRENCY
        // =========================================================

        private String detectCurrency(
                        String text) {

                String lower = text.toLowerCase();

                if (lower.contains("rm") ||
                                lower.contains("myr")) {
                        return "MYR";
                }

                if (lower.contains("$")) {
                        return "USD";
                }

                return "MYR";
        }

        // =========================================================
        // GENERIC AMOUNT
        // =========================================================

        private BigDecimal detectAmount(
                        String text,
                        String keyword) {

                Pattern pattern = Pattern.compile(
                                "(?i)" +
                                                Pattern.quote(
                                                                keyword)
                                                +
                                                "[^0-9]*" +
                                                "([0-9]+(?:\\.[0-9]{2})?)");

                Matcher matcher = pattern.matcher(
                                text);

                if (matcher.find()) {

                        return safeAmount(
                                        matcher.group(1));
                }

                return BigDecimal.ZERO;
        }

        // =========================================================
        // TAX
        // =========================================================

        private BigDecimal detectTax(
                        String text) {

                String[] lines = text.split("\\R");

                // =========================================================
                // 1. Look for a line that clearly contains TAX
                // =========================================================

                for (int i = 0; i < lines.length; i++) {

                        String current = lines[i]
                                        .toLowerCase()
                                        .replaceAll(
                                                        "\\s+",
                                                        " ")
                                        .trim();

                        if (!current.contains(
                                        "tax")) {
                                continue;
                        }

                        // Avoid lines such as:
                        // Total Sales INCL SVC TAX 11.90
                        if (current.contains(
                                        "total sales") ||
                                        current.contains(
                                                        "after adj")) {
                                continue;
                        }

                        // First try the same line.
                        List<BigDecimal> amounts = extractAmountsFromLine(
                                        lines[i]);

                        if (amounts.size() >= 2) {

                                return amounts.get(
                                                amounts.size() - 1);
                        }

                        // =====================================================
                        // 2. OCR sometimes puts the tax numbers on next line
                        // =====================================================

                        for (int offset = 1; offset <= 3 &&
                                        i + offset < lines.length; offset++) {

                                List<BigDecimal> nextAmounts = extractAmountsFromLine(
                                                lines[i +
                                                                offset]);

                                // Tax summary normally looks like:
                                // 11.23 0.67
                                if (nextAmounts.size() >= 2) {

                                        BigDecimal last = nextAmounts.get(
                                                        nextAmounts.size()
                                                                        - 1);

                                        if (last.compareTo(
                                                        BigDecimal.ZERO) > 0) {

                                                return last;
                                        }
                                }
                        }
                }

                return BigDecimal.ZERO;
        }

        private List<BigDecimal> extractAmountsFromLine(
                        String line) {

                List<BigDecimal> amounts = new ArrayList<>();

                Pattern pattern = Pattern.compile(
                                "([0-9]+[.,][0-9]{2})");

                Matcher matcher = pattern.matcher(
                                line);

                while (matcher.find()) {

                        BigDecimal value = safeAmount(
                                        matcher
                                                        .group(1)
                                                        .replace(
                                                                        ",",
                                                                        "."));

                        amounts.add(
                                        value);
                }

                return amounts;
        }

        // =========================================================
        // SERVICE CHARGE
        // =========================================================

        private BigDecimal detectServiceCharge(
                        String text) {

                String[] lines = text.split("\\R");

                for (String line : lines) {

                        String lower = line
                                        .toLowerCase()
                                        .trim();

                        if (lower.contains(
                                        "service charge") ||
                                        lower.contains(
                                                        "svc charge")) {

                                return extractLastAmount(
                                                line);
                        }
                }

                return BigDecimal.ZERO;
        }

        // =========================================================
        // TOTAL
        // =========================================================

        private BigDecimal detectTotal(
                        String text) {

                String[] keywords = {
                                "grand total",
                                "amount due",
                                "net total",
                                "total sales",
                                "total"
                };

                for (String keyword : keywords) {

                        BigDecimal amount = detectAmount(
                                        text,
                                        keyword);

                        if (amount.compareTo(
                                        BigDecimal.ZERO) > 0) {

                                return amount;
                        }
                }

                return BigDecimal.ZERO;
        }

        // =========================================================
        // CATEGORY
        // =========================================================

        private String detectCategory(
                        String text) {

                String lower = text.toLowerCase();

                // Food should take priority when actual meal words are detected.
                if (lower.contains("chicken rice") ||
                                lower.contains("chicken") ||
                                lower.contains("rice") ||
                                lower.contains("burger") ||
                                lower.contains("noodle") ||
                                lower.contains("mee") ||
                                lower.contains("coffee") ||
                                lower.contains("restaurant") ||
                                lower.contains("cafe") ||
                                lower.contains("food")) {

                        return "Food";
                }

                if (lower.contains("hotel") ||
                                lower.contains("resort")) {

                        return "Accommodation";
                }

                if (lower.contains("petrol") ||
                                lower.contains("fuel") ||
                                lower.contains("grab") ||
                                lower.contains("taxi")) {

                        return "Transport";
                }

                if (lower.contains("supermarket") ||
                                lower.contains("grocery") ||
                                lower.contains("grocer")) {

                        return "Groceries";
                }

                return "Other";
        }

        // =========================================================
        // ITEMS
        // =========================================================

        private List<ReceiptItem> detectItems(
                        String text) {

                List<ReceiptItem> items = new ArrayList<>();

                String[] lines = text.split("\\R");

                Pattern codeLinePattern = Pattern.compile(
                                "(?i)^\\s*(\\d+)x\\s+\\d+.*?([0-9]+[.,][0-9]{2})(?:ST)?\\s*$");

                for (int i = 0; i < lines.length; i++) {

                        String current = lines[i]
                                        .trim()
                                        .replaceAll(
                                                        "\\s+",
                                                        " ");

                        Matcher matcher = codeLinePattern.matcher(
                                        current);

                        if (!matcher.find()) {
                                continue;
                        }

                        BigDecimal quantity = new BigDecimal(
                                        matcher.group(1));

                        BigDecimal totalPrice = safeAmount(
                                        matcher
                                                        .group(2)
                                                        .replace(
                                                                        ",",
                                                                        "."));

                        String itemName = "";

                        // Look for description after product code line.
                        for (int j = i + 1; j < lines.length &&
                                        j <= i + 3; j++) {

                                String candidate = lines[j]
                                                .trim()
                                                .replaceAll(
                                                                "\\s+",
                                                                " ");

                                String upper = candidate
                                                .toUpperCase();

                                if (upper.contains("CHICKEN") ||
                                                upper.contains("RICE") ||
                                                upper.contains("BOILED") ||
                                                upper.contains("STEAMED")) {

                                        itemName = candidate;

                                        break;
                                }
                        }

                        if (itemName.isBlank()) {
                                continue;
                        }

                        itemName = cleanItemName(
                                        itemName);

                        ReceiptItem item = new ReceiptItem();

                        item.setName(
                                        itemName);

                        item.setQuantity(
                                        quantity);

                        BigDecimal unitPrice = quantity.compareTo(
                                        BigDecimal.ZERO) > 0
                                                        ? totalPrice.divide(
                                                                        quantity,
                                                                        2,
                                                                        java.math.RoundingMode.HALF_UP)
                                                        : totalPrice;

                        item.setUnitPrice(
                                        unitPrice);

                        item.setTotalPrice(
                                        totalPrice);

                        items.add(
                                        item);
                }

                return items;
        }

        private BigDecimal findLastAmountOnLine(
                        String text,
                        String keyword) {

                String[] lines = text.split("\\R");

                for (String line : lines) {

                        if (line
                                        .toLowerCase()
                                        .contains(
                                                        keyword.toLowerCase())) {

                                BigDecimal amount = extractLastAmount(
                                                line);

                                if (amount.compareTo(
                                                BigDecimal.ZERO) > 0) {

                                        return amount;
                                }
                        }
                }

                return BigDecimal.ZERO;
        }

        private BigDecimal extractLastAmount(
                        String line) {

                Pattern pattern = Pattern.compile(
                                "([0-9]+[.,][0-9]{2})");

                Matcher matcher = pattern.matcher(
                                line);

                BigDecimal last = BigDecimal.ZERO;

                while (matcher.find()) {

                        last = safeAmount(
                                        matcher
                                                        .group(1)
                                                        .replace(
                                                                        ",",
                                                                        "."));
                }

                return last;
        }

        private String cleanItemName(
                        String name) {

                String cleaned = name
                                .replaceAll(
                                                "^[>\\-*#]+",
                                                "")
                                .replaceAll(
                                                "\\s+",
                                                " ")
                                .trim();

                String upper = cleaned.toUpperCase();

                if (upper.contains("CHICKEN") &&
                                upper.contains("RI")) {

                        return "Chicken Rice";
                }

                if (upper.contains("CHICKEN") &&
                                upper.contains("RICE")) {

                        return "Chicken Rice";
                }

                return cleaned;
        }

        // =========================================================
        // SAFE NUMBER PARSING
        // =========================================================

        private BigDecimal safeAmount(
                        String value) {

                try {

                        return new BigDecimal(
                                        value
                                                        .replace(
                                                                        ",",
                                                                        "")
                                                        .trim());

                } catch (Exception exception) {

                        return BigDecimal.ZERO;
                }
        }
}