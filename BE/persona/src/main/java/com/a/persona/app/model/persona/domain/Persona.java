package com.a.persona.app.model.persona.domain;

import com.a.persona.app.model.common.BaseEntity;
import com.a.persona.app.model.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Persona extends BaseEntity {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "persona_sequence",
            sequenceName = "persona_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "persona_sequence"
    )
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // 굳이 entity로 따로 만들지 않고 사용
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "persona_keywords", joinColumns = @JoinColumn(name = "persona_id"))
    @Column(name = "keyword")
    @Builder.Default
    private List<String> keywords = new ArrayList<>();

    // 굳이 entity로 따로 만들지 않고 사용
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "persona_colors", joinColumns = @JoinColumn(name = "persona_id"))
    @Column(name = "color")
    @Builder.Default
    private List<String> colors = new ArrayList<>();

    private Boolean isSaved = false;

    // todo 코드 넣기
}
