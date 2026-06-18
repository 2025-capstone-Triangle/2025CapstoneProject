package com.a.persona.app.model.auth.token;

import com.a.persona.app.model.auth.token.entity.RefreshToken;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
    Optional<RefreshToken> findByAtId(String atId);
    void deleteByAtId(String atId);
}
