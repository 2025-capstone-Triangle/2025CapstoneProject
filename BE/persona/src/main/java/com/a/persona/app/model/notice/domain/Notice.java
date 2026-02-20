package com.a.persona.app.model.notice.domain;

import com.a.persona.app.model.common.BaseEntity;
import com.a.persona.app.model.member.domain.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notice extends BaseEntity{

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "notice_sequence",
            sequenceName = "notice_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "notice_sequence"
    )
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String content;



}
