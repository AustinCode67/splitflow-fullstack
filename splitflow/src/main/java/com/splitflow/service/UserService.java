package com.splitflow.service;

import com.splitflow.model.Group;
import com.splitflow.model.LoginResponse;
import com.splitflow.model.User;

import com.splitflow.repository.GroupMemberRepository;
import com.splitflow.repository.GroupRepository;
import com.splitflow.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final GroupRepository groupRepository;

    private final GroupMemberRepository groupMemberRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            GroupRepository groupRepository,
            GroupMemberRepository groupMemberRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    // =========================================================
    // GET ALL USERS
    // =========================================================

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // =========================================================
    // CREATE USER
    // =========================================================

    public User createUser(User user) {

        String email = user.getEmail()
                .trim()
                .toLowerCase();

        user.setEmail(email);

        if (userRepository.existsByEmail(email)) {

            throw new RuntimeException(
                    "A user with this email already exists.");
        }

        String encodedPassword = passwordEncoder.encode(
                user.getPassword());

        user.setPassword(
                encodedPassword);

        return userRepository.save(user);
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public LoginResponse login(
            String email,
            String password) {

        if (email == null ||
                email.isBlank() ||
                password == null ||
                password.isBlank()) {

            throw new RuntimeException(
                    "Email and password are required.");
        }

        String normalizedEmail = email
                .trim()
                .toLowerCase();

        User user = userRepository
                .findByEmail(
                        normalizedEmail)
                .orElseThrow(() -> new RuntimeException(
                        "Invalid email or password."));

        boolean passwordMatches = passwordEncoder.matches(
                password,
                user.getPassword());

        if (!passwordMatches) {

            throw new RuntimeException(
                    "Invalid email or password.");
        }

        String token = jwtService.generateToken(
                user.getEmail());

        return new LoginResponse(
                token,
                user.getName(),
                user.getEmail());
    }

    // =========================================================
    // DELETE ACCOUNT
    // =========================================================

    @Transactional
    public void deleteUserAccount(
            String email) {

        if (email == null ||
                email.isBlank()) {

            throw new RuntimeException(
                    "Authentication is required.");
        }

        String normalizedEmail = email
                .trim()
                .toLowerCase();

        User user = userRepository
                .findByEmail(
                        normalizedEmail)
                .orElseThrow(() -> new RuntimeException(
                        "User not found."));

        // Check whether the user owns any groups.
        List<Group> ownedGroups = groupRepository
                .findByCreatedByEmail(
                        normalizedEmail);

        if (!ownedGroups.isEmpty()) {

            throw new RuntimeException(
                    "You must delete or transfer ownership of your groups before deleting your account.");
        }

        // Remove the user from every group they belong to.
        groupMemberRepository
                .deleteByUserEmail(
                        normalizedEmail);

        // Historical expenses/payments remain intact.
        // They use email values for their historical records.

        userRepository.delete(user);
    }
}