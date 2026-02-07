package com.a.persona.app.model.contentLog.domain;


import com.a.persona.app.model.reference.domain.Reference;
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
public class ContentLog{

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "content_log_sequence",
            sequenceName = "content_log_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "content_log_sequence"
    )
    private Long id;

    @Builder.Default
    @Column(name = "analysis_time")
    private LocalDateTime time = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_id")
    private Reference reference;


}
