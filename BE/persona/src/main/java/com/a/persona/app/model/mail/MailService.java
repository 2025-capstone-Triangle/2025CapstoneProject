package com.a.persona.app.model.mail;


import com.a.persona.app.model.auth.AuthService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;
    private final AuthService authService;
    private final SpringTemplateEngine templateEngine;

    /**
     * 사용자에게 인증 코드를 전송
     * @param email 사용자 이메일
     * @throws MessagingException
     * @throws IOException
     */
    public void sendVerificationEmail(String email) throws MessagingException, IOException {
        int codeInt = (int) (Math.random() * 99999) + 1;
        String code = String.format("%05d", codeInt);
        // 생성한 코드 저장
        authService.saveVerifyCode(email, code);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        // 메일 제목, 수신자 설정
        helper.setTo(email);
        helper.setSubject("Persona 인증코드 안내");

        // HTML 템플릿에 코드 삽입
        Context context = new Context();
        context.setVariable("code", code);
        String html = templateEngine.process("verify_code_mail", context); // .html 생략

        helper.setText(html, true);

//        // CID 기반 inline image 삽입
//        ClassPathResource image = new ClassPathResource("static/image/logo.png");
//        helper.addInline("logo", image, "image/png");

        mailSender.send(message);
    }
}
