package com.a.persona.app.model.reference.domain;

import com.a.persona.app.model.common.BaseEntity;
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
public class Reference extends BaseEntity {
    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "reference_sequence",
            sequenceName = "reference_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "reference_sequence"
    )
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String img;

    @Column(nullable = false)
    private String prompt;
}
