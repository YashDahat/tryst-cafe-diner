package com.webappfoundation.tryst;

import com.webappfoundation.model.Branch;
import com.webappfoundation.model.Product;
import com.webappfoundation.repository.BranchRepository;
import com.webappfoundation.repository.ProductRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.List;

/**
 * Seeds the outlet (real address, phone, coordinates), a starter menu and the two combo windows.
 * Menu PRICES AND ITEM NAMES ARE PLACEHOLDERS anchored to the published ~Rs 800 for two and a Rs 90 beverage;
 * the owner confirms them via /admin/products (bulk upload). Idempotent by slug.
 */
@Component
@Order(20)
public class TrystSeeder {
    public static final String BRANCH_SLUG = "tryst-fc-road";

    private final BranchRepository branches;
    private final ProductRepository products;
    private final ComboWindowRepository windows;

    public TrystSeeder(BranchRepository branches, ProductRepository products, ComboWindowRepository windows) {
        this.branches = branches;
        this.products = products;
        this.windows = windows;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        if (branches.findBySlug(BRANCH_SLUG).isEmpty()) {
            Instant now = Instant.now();
            branches.save(Branch.builder().name("TRYST, FC Road").slug(BRANCH_SLUG).phone("+91 98225 23069")
                    .addressLine("Dnyaneshwar Paduka Chowk, Ferguson College Rd, Sud Nagar, Shivajinagar")
                    .city("Pune").state("Maharashtra").pincode("411005").latitude(18.526713).longitude(73.84239)
                    .googleMapsUrl("https://www.google.com/maps/place/?q=place_id:ChIJk8P-WQC_wjsRfXk7P14TKu0")
                    .openingHours("Mon-Thu 10:30 am-10:30 pm; Fri-Sun 10:30 am-11:00 pm").active(true)
                    .createdAt(now).updatedAt(now).build());
        }
        item("chicken-ramen", "Chicken Ramen", "Ramen & Bowls", "380", "non-veg", true, "Slow-simmered broth, noodles and a soft egg. A guest favourite in reviews.", "signature");
        item("veg-ramen", "Veg Ramen", "Ramen & Bowls", "340", "veg", true, "Vegetable broth, noodles and greens.", "signature");
        item("grilled-chicken-bowl", "Grilled Chicken Bowl", "Ramen & Bowls", "360", "non-veg", false, "Grilled chicken over a warm, filling bowl.");
        item("aglio-e-olio", "Aglio e Olio", "Pasta", "320", "veg", false, "Garlic, olive oil and chilli, well seasoned.", "signature");
        item("alfredo-pasta", "Alfredo Pasta", "Pasta", "340", "veg", false, "Creamy white-sauce pasta.");
        item("mexican-pizza", "Mexican Pizza", "Pizza", "380", "veg", true, "Beans, peppers and jalapeno.");
        item("pesto-pizza", "Pesto Pizza", "Pizza", "390", "veg", true, "Basil pesto base.");
        item("la-sicilia-pizza", "La Sicilia Pizza", "Pizza", "420", "non-veg", true, "House pizza, details to be confirmed by the kitchen.");
        item("classic-iced-tea", "Classic Iced Tea", "Iced Teas & Mocktails", "90", "veg", false, "Not too sweet.", "signature");
        item("seasonal-mocktail", "Seasonal Mocktail", "Iced Teas & Mocktails", "180", "veg", false, "Changes with the season.");
        item("cold-coffee", "Cold Coffee", "Coffee", "190", "veg", false, "Cold, strong and smooth.");
        item("dessert-of-the-day", "Dessert of the Day", "Desserts", "220", "veg", false, "Ask at the counter what is on today.");
        Product lectures = item("between-lectures-combo", "Between Lectures combo", "Combos", "399", "veg", false, "A pasta or veg ramen with a classic iced tea.");
        Product desk = item("desk-break-combo", "Desk Break combo", "Combos", "449", "veg", false, "A bowl and a drink, ready for pickup.");
        combo(lectures, "Between Lectures", "MON-FRI", LocalTime.of(15, 0), LocalTime.of(18, 0), "Students");
        combo(desk, "Desk Break", "MON-FRI", LocalTime.of(12, 0), LocalTime.of(15, 0), "Offices and co-working");
    }

    private Product item(String slug, String name, String category, String price, String diet, boolean stock, String desc, String... tags) {
        return products.findBySlug(slug).orElseGet(() -> {
            Instant now = Instant.now();
            java.util.List<String> features = new java.util.ArrayList<>(List.of(diet));
            features.addAll(List.of(tags));
            return products.save(Product.builder().name(name).slug(slug).description(desc).price(new BigDecimal(price))
                    .category(category).features(features).stockTracked(stock).stock(stock ? 40 : null).reserved(0)
                    .workflowCode("takeaway").active(true).createdAt(now).updatedAt(now).build());
        });
    }

    private void combo(Product p, String label, String days, LocalTime from, LocalTime to, String audience) {
        if (windows.findByProductId(p.getId()).isEmpty()) {
            windows.save(ComboWindow.builder().productId(p.getId()).label(label).days(days).availableFrom(from)
                    .availableTo(to).audience(audience).build());
        }
    }
}
