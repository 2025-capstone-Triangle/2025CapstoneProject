package com.a.persona.app.model.content.domain;

import com.a.persona.app.model.common.BaseEntity;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.reference.domain.Reference;
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
public class ContentLike{
    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "content_like_sequence",
            sequenceName = "content_like_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "content_like_sequence"
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Content content;
}
