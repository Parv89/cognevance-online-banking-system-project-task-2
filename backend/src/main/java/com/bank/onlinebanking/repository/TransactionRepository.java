package com.bank.onlinebanking.repository;

import com.bank.onlinebanking.entity.Transaction;
import com.bank.onlinebanking.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionReference(String transactionReference);

    @Query("SELECT t FROM Transaction t WHERE t.sourceAccount.id = :accountId OR t.targetAccount.id = :accountId ORDER BY t.createdAt DESC")
    List<Transaction> findByAccountIdOrderByCreatedAtDesc(@Param("accountId") Long accountId);

    @Query("SELECT t FROM Transaction t WHERE (t.sourceAccount.user.id = :userId OR t.targetAccount.user.id = :userId) ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t WHERE (t.sourceAccount.user.id = :userId OR t.targetAccount.user.id = :userId) " +
            "AND (:type IS NULL OR t.type = :type) " +
            "ORDER BY t.createdAt DESC")
    Page<Transaction> findUserTransactionsWithFilter(@Param("userId") Long userId,
                                                    @Param("type") TransactionType type,
                                                    Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.sourceAccount.id = :accountId OR t.targetAccount.id = :accountId) " +
            "AND (:type IS NULL OR t.type = :type) " +
            "ORDER BY t.createdAt DESC")
    Page<Transaction> findAccountTransactionsWithFilter(@Param("accountId") Long accountId,
                                                       @Param("type") TransactionType type,
                                                       Pageable pageable);
}
