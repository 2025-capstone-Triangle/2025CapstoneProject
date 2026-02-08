package com.a.persona.app.model.reference.domain;

import com.a.persona.app.model.common.BaseEntity;
import com.a.persona.app.model.member.domain.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferenceLike{
    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "reference_like_sequence",
            sequenceName = "reference_like_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "reference_like_sequence"
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Reference reference;

    @ManyToOne(fetch = FetchType.LAZY)
    private Member member;

}
