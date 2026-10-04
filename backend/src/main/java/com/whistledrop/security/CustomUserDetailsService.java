package com.whistledrop.security;

import com.whistledrop.entity.Moderator;
import com.whistledrop.repository.ModeratorRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final ModeratorRepository moderatorRepository;

    public CustomUserDetailsService(ModeratorRepository moderatorRepository) {
        this.moderatorRepository = moderatorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Moderator moderator = moderatorRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Moderator not found with username: " + username));

        return new User(
                moderator.getUsername(),
                moderator.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(moderator.getRole()))
        );
    }
}
