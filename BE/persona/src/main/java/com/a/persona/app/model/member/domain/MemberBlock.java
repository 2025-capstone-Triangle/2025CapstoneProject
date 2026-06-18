package com.a.persona.app.model.member.domain;

import com.a.persona.app.model.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberBlock {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "member_block_sequence",
            sequenceName = "member_block_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "member_block_sequence"
    )
    private Long id;

    @OneToOne
    private Member member;

    private String reason;

    private LocalDateTime blockedAt=LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.blockedAt = LocalDateTime.now();
    }
}
