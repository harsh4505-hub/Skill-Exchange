package com.skillexchange.service;

import com.skillexchange.dto.MatchResultDto;
import com.skillexchange.dto.UserSkillDto;
import com.skillexchange.entity.*;
import com.skillexchange.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * MatchingService: Core Algorithmic Module (Module 4)
 * ===================================================
 * Implements a transparent, explainable heuristic matching formula
 * for college peer-to-peer skill exchanges.
 */
@Service
public class MatchingService {

    @Autowired
    private StudentProfileRepository profileRepository;

    @Autowired
    private UserTeachingSkillRepository teachingSkillRepository;

    @Autowired
    private UserLearningSkillRepository learningSkillRepository;

    @Autowired
    private BlockedUserRepository blockedUserRepository;

    /**
     * Calculates and ranks skill exchange partners for the specified student.
     *
     * @param currentUserId The ID of the student seeking skill partners (or null for guest)
     * @return List of MatchResultDto sorted from highest match percentage to lowest
     */
    public List<MatchResultDto> findMatchesForStudent(Long currentUserId) {
        StudentProfile currentProfile = currentUserId != null ? profileRepository.findByUserId(currentUserId).orElse(null) : null;

        // 1. Fetch Student A's teaching and learning skills
        List<UserTeachingSkill> aTeaching = currentUserId != null ? teachingSkillRepository.findByUserId(currentUserId) : Collections.emptyList();
        List<UserLearningSkill> aLearning = currentUserId != null ? learningSkillRepository.findByUserId(currentUserId) : Collections.emptyList();

        Set<Long> aWantsSkillIds = aLearning.stream()
                .map(l -> l.getSkill().getId())
                .collect(Collectors.toSet());

        Set<Long> aTeachesSkillIds = aTeaching.stream()
                .map(t -> t.getSkill().getId())
                .collect(Collectors.toSet());

        // 2. Fetch all other active student candidates
        List<StudentProfile> candidates = profileRepository.findByIsBlockedFalse().stream()
                .filter(p -> currentUserId == null || !p.getUser().getId().equals(currentUserId))
                .filter(p -> !"ROLE_ADMIN".equals(p.getUser().getRole()))
                .filter(p -> currentUserId == null || !blockedUserRepository.existsByBlockerIdAndBlockedId(currentUserId, p.getUser().getId()))
                .filter(p -> currentUserId == null || !blockedUserRepository.existsByBlockerIdAndBlockedId(p.getUser().getId(), currentUserId))
                .collect(Collectors.toList());

        List<MatchResultDto> results = new ArrayList<>();

        for (StudentProfile candidate : candidates) {
            Long candidateUserId = candidate.getUser().getId();
            List<UserTeachingSkill> bTeaching = teachingSkillRepository.findByUserId(candidateUserId);
            List<UserLearningSkill> bLearning = learningSkillRepository.findByUserId(candidateUserId);

            // Direct check: What candidate B teaches that student A wants to learn
            Optional<UserTeachingSkill> directMatch = bTeaching.stream()
                    .filter(t -> aWantsSkillIds.contains(t.getSkill().getId()))
                    .findFirst();

            // Reverse match: Candidate B wants what Student A teaches
            Optional<UserLearningSkill> reverseMatch = bLearning.stream()
                    .filter(l -> aTeachesSkillIds.contains(l.getSkill().getId()))
                    .findFirst();

            double score = 0.0;
            List<String> explanationParts = new ArrayList<>();

            // --- 1. Direct Skill Compatibility (40%) ---
            if (directMatch.isPresent()) {
                score += 40.0;
                explanationParts.add("Teaches " + directMatch.get().getSkill().getName() + " (+40%)");
            } else if (currentProfile == null) {
                score += 20.0;
            }

            // --- 2. Reverse Skill Compatibility (20%) ---
            boolean isMutual = false;
            if (reverseMatch.isPresent()) {
                score += 20.0;
                isMutual = true;
                explanationParts.add("Wants to learn " + reverseMatch.get().getSkill().getName() + " (+20% Mutual Trade)");
            }

            // --- 3. Rating Score (15%) ---
            double rating = candidate.getAverageRating() > 0 ? candidate.getAverageRating() : 3.5;
            double ratingScore = (rating / 5.0) * 15.0;
            score += ratingScore;
            explanationParts.add(String.format("Rating %.1f/5 (+%.1f%%)", rating, ratingScore));

            // --- 4. Verification Status (15%) ---
            if (candidate.isVerified() || (directMatch.isPresent() && directMatch.get().isVerified())) {
                score += 15.0;
                explanationParts.add("Verified Skill Badge (+15%)");
            } else {
                score += 6.0;
                explanationParts.add("Basic Profile (+6%)");
            }

            // --- 5. College / Department / Domain Overlap (10%) ---
            if (currentProfile != null) {
                boolean sameDept = candidate.getDepartment().equalsIgnoreCase(currentProfile.getDepartment());
                boolean sameCollege = candidate.getCollege().equalsIgnoreCase(currentProfile.getCollege());
                if (sameDept && sameCollege) {
                    score += 10.0;
                    explanationParts.add("Same Dept & College (+10%)");
                } else if (sameCollege || sameDept) {
                    score += 7.0;
                    explanationParts.add("Academic Synergy (+7%)");
                } else {
                    score += 4.0;
                    explanationParts.add("Cross-Campus Match (+4%)");
                }
            } else {
                score += 8.0;
                explanationParts.add("Campus Opportunity");
            }

            int finalMatchPercent = (int) Math.min(100, Math.round(score));

            MatchResultDto matchDto = new MatchResultDto();
            matchDto.setStudentId(candidate.getId());
            matchDto.setUserId(candidateUserId);
            matchDto.setStudentName(candidate.getFullName());
            matchDto.setCollege(candidate.getCollege());
            matchDto.setDepartment(candidate.getDepartment());
            matchDto.setYearOfStudy(candidate.getYearOfStudy());
            matchDto.setAvatarUrl(candidate.getAvatarUrl());
            matchDto.setAverageRating(candidate.getAverageRating());
            matchDto.setVerified(candidate.isVerified());

            // Primary skill they teach
            UserTeachingSkill primaryTeach = directMatch.orElse(!bTeaching.isEmpty() ? bTeaching.get(0) : null);
            if (primaryTeach != null) {
                matchDto.setSkillTheyTeachYou(primaryTeach.getSkill().getName());
                matchDto.setSkillTheyTeachYouId(primaryTeach.getSkill().getId());
                matchDto.setCategoryName(primaryTeach.getSkill().getCategory().getName());
            } else {
                matchDto.setSkillTheyTeachYou("General Mentoring");
                matchDto.setSkillTheyTeachYouId(null);
                matchDto.setCategoryName("General");
            }

            if (reverseMatch.isPresent()) {
                matchDto.setSkillYouTeachThem(reverseMatch.get().getSkill().getName());
                matchDto.setSkillYouTeachThemId(reverseMatch.get().getSkill().getId());
            } else {
                matchDto.setSkillYouTeachThem("");
                matchDto.setSkillYouTeachThemId(null);
            }

            // Map all teaching and learning skills for candidate
            List<UserSkillDto> teachingDtos = bTeaching.stream().map(t -> new UserSkillDto(
                    t.getId(),
                    t.getSkill().getId(),
                    t.getSkill().getName(),
                    t.getSkill().getCategory().getId(),
                    t.getSkill().getCategory().getName(),
                    t.getProficiencyLevel(),
                    t.isVerified(),
                    t.getProofDocumentUrl(),
                    t.getVerificationNotes()
            )).collect(Collectors.toList());

            List<UserSkillDto> learningDtos = bLearning.stream().map(l -> new UserSkillDto(
                    l.getId(),
                    l.getSkill().getId(),
                    l.getSkill().getName(),
                    l.getSkill().getCategory().getId(),
                    l.getSkill().getCategory().getName(),
                    l.getUrgencyLevel(),
                    false,
                    null,
                    l.getNotes()
            )).collect(Collectors.toList());

            matchDto.setTeachingSkills(teachingDtos);
            matchDto.setLearningSkills(learningDtos);

            Set<String> allCats = new LinkedHashSet<>();
            if (primaryTeach != null) allCats.add(primaryTeach.getSkill().getCategory().getName());
            teachingDtos.forEach(t -> { if (t.getCategoryName() != null) allCats.add(t.getCategoryName()); });
            learningDtos.forEach(l -> { if (l.getCategoryName() != null) allCats.add(l.getCategoryName()); });
            matchDto.setCategories(new ArrayList<>(allCats));

            matchDto.setMutualMatch(isMutual && directMatch.isPresent());
            matchDto.setMatchPercentage(finalMatchPercent);
            matchDto.setMatchReason(String.join(" | ", explanationParts));

            results.add(matchDto);
        }

        // Rank by highest match percentage first
        results.sort((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage()));
        return results;
    }
}
