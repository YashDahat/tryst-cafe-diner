package com.webappfoundation.tryst;

import com.webappfoundation.catalog.CatalogItemResolver;
import com.webappfoundation.dto.CatalogItemDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Maps a future seating window to the universal sellable shape (₹0, follows the {@code table} workflow). */
@Component
public class TableSlotResolver implements CatalogItemResolver {
    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("EEE d MMM, h:mm a", Locale.ENGLISH).withZone(TableSlotService.IST);
    private final TableSlotRepository slots;

    public TableSlotResolver(TableSlotRepository slots) {
        this.slots = slots;
    }

    @Override
    public String itemType() {
        return TableSlotInventoryProvider.TYPE;
    }

    @Override
    public List<CatalogItemDto> resolve(Collection<Long> ids) {
        Instant now = Instant.now();
        return slots.findByIdIn(ids).stream()
                .filter(s -> s.isActive() && s.getStartsAt().isAfter(now))
                .map(s -> CatalogItemDto.builder()
                        .itemType(TableSlotInventoryProvider.TYPE).itemId(s.getId())
                        .name("Table at TRYST, " + FMT.format(s.getStartsAt()))
                        .description("Saved table (no charge)")
                        .price(BigDecimal.ZERO).priceUnit("per guest")
                        .slug("table-" + s.getId()).detailPath("/reserve")
                        .category("Table").active(true).cartable(false)
                        .workflowCode("table")
                        .attributes(Map.of("startsAt", s.getStartsAt().toString()))
                        .build())
                .toList();
    }
}
