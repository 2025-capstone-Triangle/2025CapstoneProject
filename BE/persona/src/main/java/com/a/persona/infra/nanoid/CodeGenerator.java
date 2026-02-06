package com.a.persona.infra.nanoid;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class CodeGenerator {
    // 가독성을 위해 헷갈리는 문자(0, O, I, l)를 제외한 커스텀 알파벳 사용 가능
    private static final char[] ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".toCharArray();

    public static String generateShareCode() {
        // 8자리의 유니크한 코드 생성
        return NanoIdUtils.randomNanoId(new Random(), ALPHABET, 10);
    }
}
