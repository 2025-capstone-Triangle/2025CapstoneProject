package com.a.persona.app.model.content.repo;

import com.a.persona.app.model.content.domain.Content;
import com.a.persona.app.model.content.domain.ContentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentLikeRepository extends JpaRepository<ContentLike, Integer> {
    void deleteContentLikeByContent(Content content);
}
