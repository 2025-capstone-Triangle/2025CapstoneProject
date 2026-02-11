package com.a.persona.app.controller.content.payload;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ContentLikeReqeust {

    Long id;
    Boolean like;

}
