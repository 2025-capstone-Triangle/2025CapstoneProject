package com.a.persona.app.model.personaLog.domain;

import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.persona.domain.Persona;
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
public class PersonaLog{

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "persona_log_sequence",
            sequenceName = "persona_log_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "persona_log_sequence"
    )
    private Long id;

    @Builder.Default
    @Column(name = "analysis_time")
    private LocalDateTime time = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id")
    private Persona persona;


}
