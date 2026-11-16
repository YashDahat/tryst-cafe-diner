package com.webappfoundation.tryst;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TableSlotRepository extends JpaRepository<TableSlot, Long> {
    List<TableSlot> findBySlotDateOrderByStartsAt(LocalDate date);

    List<TableSlot> findByIdIn(Collection<Long> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from TableSlot s where s.id = :id")
    Optional<TableSlot> lockById(@Param("id") Long id);
}
