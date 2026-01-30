package com.smartcommerce.backend.domain.repository;

import com.smartcommerce.backend.domain.model.Order;
import com.smartcommerce.backend.domain.dto.UserSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT DISTINCT new com.smartcommerce.backend.domain.dto.UserSummary(u.id, CONCAT(u.firstName, ' ', u.lastName), u.email) "
            +
            "FROM Order o JOIN o.user u")
    List<UserSummary> findUsersWithOrders();

    @Query("SELECT o.id FROM Order o WHERE o.user.id = :userId")
    List<Long> findOrderIdsByUserId(Long userId);

    List<Order> findByUserId(Long userId);

    List<Order> findByClientId(Long clientId);

    @Query("SELECT o.id FROM Order o WHERE o.client.id = :clientId")
    List<Long> findOrderIdsByClientId(Long clientId);
}
