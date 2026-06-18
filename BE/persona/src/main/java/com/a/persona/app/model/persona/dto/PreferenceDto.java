package com.a.persona.app.model.persona.dto;

import com.a.persona.app.model.persona.domain.Preference;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreferenceDto {

    private Long id;

    private Long q1Environment;

    private Long q2Style;

    private Long q3MinimalMaximal;

    private Long q4Mood;

    private Long q5ContrastType;

    private Long q6Motion;

    private Long q7Framing;

    private List<Long> q8Tone = new ArrayList<>();

    public static PreferenceDto fromEntity(Preference preference) {
        return PreferenceDto.builder()
                .q1Environment(preference.getQ1Environment())
                .q2Style(preference.getQ2Style())
                .q3MinimalMaximal(preference.getQ3MinimalMaximal())
                .q4Mood(preference.getQ4Mood())
                .q5ContrastType(preference.getQ5ContrastType())
                .q6Motion(preference.getQ6Motion())
                .q7Framing(preference.getQ7Framing())
                .q8Tone(preference.getQ8Tone())
                .build();
    }

}
