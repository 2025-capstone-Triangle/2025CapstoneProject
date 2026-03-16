package com.a.persona.app.model.content.code;

public enum ContentType {
    // todo 확인 후 숫자 수정
    SQUARE(0),
    FEED(1),
    STORY(2);

    final Integer value;

    ContentType(Integer value) {
        this.value = value;
    }

    public Integer value() {
        return value;
    }
}
