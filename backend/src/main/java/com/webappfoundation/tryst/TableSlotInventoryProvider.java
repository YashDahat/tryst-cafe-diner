package com.webappfoundation.tryst;

import com.webappfoundation.inventory.InventoryProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Seats are the stock: the order line quantity is the party size. {@code reserved} holds both held and seated
 * covers, so commit is a no-op and release (cancel, expiry, no-show clean-up) hands the covers back.
 */
@Component
public class TableSlotInventoryProvider implements InventoryProvider {
    public static final String TYPE = "TABLE_SLOT";
    private final TableSlotRepository slots;

    public TableSlotInventoryProvider(TableSlotRepository slots) {
        this.slots = slots;
    }

    @Override
    public String itemType() {
        return TYPE;
    }

    @Override
    public boolean availableAt(Long itemId, Long branchId) {
        return slots.findById(itemId).map(s -> s.isActive() && s.getCapacity() - s.getReserved() > 0).orElse(false);
    }

    @Override
    @Transactional
    public void reserve(Long itemId, String variantKey, Long branchId, int qty) {
        TableSlot s = slots.lockById(itemId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "That time is no longer offered"));
        if (!s.isActive() || s.getCapacity() - s.getReserved() < qty) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Not enough seats left at that time. Try another slot.");
        }
        s.setReserved(s.getReserved() + qty);
        slots.save(s);
    }

    @Override
    public void commit(Long itemId, String variantKey, Long branchId, int qty) {
        // covers stay counted in `reserved`
    }

    @Override
    @Transactional
    public void release(Long itemId, String variantKey, Long branchId, int qty) {
        slots.lockById(itemId).ifPresent(s -> {
            s.setReserved(Math.max(0, s.getReserved() - Math.max(0, qty)));
            slots.save(s);
        });
    }
}
