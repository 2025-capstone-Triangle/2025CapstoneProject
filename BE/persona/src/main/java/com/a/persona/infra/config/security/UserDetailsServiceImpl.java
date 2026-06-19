package com.a.persona.infra.config.security;

import com.a.persona.app.model.auth.domain.Principal;
import com.a.persona.app.model.member.domain.Member;
import com.a.persona.app.model.member.repo.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final MemberRepository memberRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) {
        Member member = memberRepository.findByUsername(username)
                            .orElseThrow(() -> new UsernameNotFoundException(username));
        List<SimpleGrantedAuthority> authorities = findUserAuthorities(username);
        return Principal.createPrincipal(member, authorities);
    }
    
    public List<SimpleGrantedAuthority> findUserAuthorities(String username){
        Member member = memberRepository.findByUsername(username)
                            .orElseThrow(() -> new UsernameNotFoundException(username));
        
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(member.getRole().name()));
        return authorities;
    }
}
