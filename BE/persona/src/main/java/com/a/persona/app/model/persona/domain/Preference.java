package com.a.persona.app.model.persona.domain;

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
public class Preference {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "persona_preference_sequence",
            sequenceName = "persona_preference_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "persona_preference_sequence"
    )
    private Long id;

    @Column(nullable = false, name = "q1_environment")
    private Long q1Environment;

    @Column(nullable = false, name = "q2_style")
    private Long q2Style;

    @Column(nullable = false, name = "q3_minimal_maximal")
    private Long q3MinimalMaximal;

    @Column(nullable = false, name = "q4_mood")
    private Long q4Mood;

    @Column(nullable = false, name = "q5_contrast_type")
    private Long q5ContrastType;

    @Column(nullable = false, name = "q6_motion")
    private Long q6Motion;

    @Column(nullable = false, name = "q7_framing")
    private Long q7Framing;

    // 굳이 entity로 따로 만들지 않고 사용
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "q8_tone", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "q8_tone")
    @Builder.Default
    private List<Long> q8Tone = new ArrayList<>();

}
