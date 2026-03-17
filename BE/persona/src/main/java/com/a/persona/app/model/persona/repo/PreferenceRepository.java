package com.a.persona.app.model.persona.repo;

import com.a.persona.app.model.persona.domain.Preference;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreferenceRepository extends JpaRepository<Preference,Integer> {
}
