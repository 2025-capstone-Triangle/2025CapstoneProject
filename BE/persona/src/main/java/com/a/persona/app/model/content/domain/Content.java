package com.a.persona.app.model.content.domain;

import com.a.persona.app.model.common.BaseEntity;
import com.a.persona.app.model.content.code.ContentType;
import com.a.persona.app.model.persona.domain.Persona;
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
public class Content extends BaseEntity {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "content_sequence",
            sequenceName = "content_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "content_sequence"
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_id", nullable = false)
    private Reference reference;

    @Column(nullable = false)
    private String img;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ContentType type;

    private String description;

}
