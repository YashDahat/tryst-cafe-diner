package com.webappfoundation.tryst;

import com.webappfoundation.dto.LoyaltyEventRuleDto;
import com.webappfoundation.service.LoyaltyConfigService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Public, read-only list of the live coin-earning rules, so the site never hard-codes numbers. Lives under
 * /api/v1/public because /api/v1/loyalty/** requires sign-in. Coins paid = the rule's points; PURCHASE coins
 * are a percentage of the order, so it carries no fixed amount.
 */
@RestController
@RequestMapping("/api/v1/public")
public class EarnRulesController {
    private static final Map<String, String> LABELS = Map.ofEntries(
            Map.entry("SIGNUP", "Join TRYST"),
            Map.entry("PURCHASE", "Order or dine with us"),
            Map.entry("REVIEW", "Rate a dish"),
            Map.entry("REVIEW_MEDIA", "Add a photo to your review"),
            Map.entry("FEEDBACK", "Tell us how your order went"),
            Map.entry("SUGGESTION", "Suggest an idea"),
            Map.entry("REFERRAL_SIGNUP", "Bring a friend"),
            Map.entry("REFERRAL_PURCHASE", "A friend's first order"),
            Map.entry("SHARE_CLICK", "Share a Tryst card"),
            Map.entry("WISHLIST", "Save a favourite"),
            Map.entry("PROFILE_COMPLETE", "Complete your profile"),
            Map.entry("NOTIF_OPT_IN", "Turn on updates"));

    public record EarnRule(String eventType, String label, java.math.BigDecimal coins, Integer perDayCap, boolean onceOnly) {
    }

    private final LoyaltyConfigService config;

    public EarnRulesController(LoyaltyConfigService config) {
        this.config = config;
    }

    @GetMapping("/earn-rules")
    public List<EarnRule> earnRules() {
        return config.listEventRules().stream()
                .filter(LoyaltyEventRuleDto::isEarnsCoins)
                .map(r -> new EarnRule(r.getEventType().name(), LABELS.getOrDefault(r.getEventType().name(), r.getEventType().name()),
                        r.getPoints(), r.getPerDayCap(), r.isOnceOnly()))
                .toList();
    }
}
