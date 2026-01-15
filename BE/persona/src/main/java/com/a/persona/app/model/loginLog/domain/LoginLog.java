package com.a.persona.app.model.loginLog.domain;


import com.a.persona.app.model.member.domain.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginLog {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "login_log_sequence",
            sequenceName = "login_log_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "login_log_sequence"
    )
    private Long id;

    @Builder.Default
    @Column(name = "analysis_time")
    private LocalDateTime time = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;
}
