package com.skillexchange.service;

import com.skillexchange.dto.MatchResultDto;
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
 *
 * Matching Score Formula:
 * -------------------------------------------------------------------------
 *  1. Direct Skill Compatibility (40%):
 *     Does Student B teach at least one skill that Student A wants to learn?
 *     Full 40 points if direct match exists; 0 points otherwise.
 *
 *  2. Reverse Skill Compatibility (20%):
 *     Does Student A teach at least one skill that Student B wants to learn?
 *     Two-way mutual trade yields 20 points, establishing a win-win barter.
 *
 *  3. Peer Rating Factor (15%):
 *     (Student B's Average Rating / 5.0) * 15 points.
 *     If student is new (0 ratings), defaults to 3.0 baseline (9 points).
 *
 *  4. Admin Verification Factor (15%):
 *     Full 15 points if Student B has earned a verified skill badge.
 *     5 baseline points if unverified.
 *
 *  5. Academic / Category Overlap Factor (10%):
 *     10 points if students share same college/department or have skills
 *     in related domain categories; 5 points otherwise.
 * -------------------------------------------------------------------------
 *  Total Match Score = (1) + (2) + (3) + (4) + (5)  --> Maximum 100%
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
     * @param currentUserId The ID of the student seeking skill partners
     * @return List of MatchResultDto sorted from highest match percentage to lowest
     */
    public List<MatchResultDto> findMatchesForStudent(Long currentUserId) {
        StudentProfile currentProfile = profileRepository.findByUserId(currentUserId).orElse(null);
        if (currentProfile == null) {
            return Collections.emptyList();
        }

        // 1. Fetch Student A's teaching and learning skills
        List<UserTeachingSkill> aTeaching = teachingSkillRepository.findByUserId(currentUserId);
        List<UserLearningSkill> aLearning = learningSkillRepository.findByUserId(currentUserId);

        Set<Long> aWantsSkillIds = aLearning.stream()
                .map(l -> l.getSkill().getId())
                .collect(Collectors.toSet());

        Set<Long> aTeachesSkillIds = aTeaching.stream()
                .map(t -> t.getSkill().getId())
                .collect(Collectors.toSet());

        // 2. Fetch all other active student candidates
        List<StudentProfile> candidates = profileRepository.findByIsBlockedFalse().stream()
                .filter(p -> !p.getUser().getId().equals(currentUserId))
                .filter(p -> !"ROLE_ADMIN".equals(p.getUser().getRole()))
                .filter(p -> !blockedUserRepository.existsByBlockerIdAndBlockedId(currentUserId, p.getUser().getId()))
                .filter(p -> !blockedUserRepository.existsByBlockerIdAndBlockedId(p.getUser().getId(), currentUserId))
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

            // If Candidate B does not teach anything Student A wants, check if Candidate B wants what Student A teaches
            // (even if one-way, they may still explore)
            Optional<UserLearningSkill> reverseMatch = bLearning.stream()
                    .filter(l -> aTeachesSkillIds.contains(l.getSkill().getId()))
                    .findFirst();

            // We include candidate if there is at least one skill overlap (direct or reverse)
            if (directMatch.isPresent() || reverseMatch.isPresent()) {
                double score = 0.0;
                List<String> explanationParts = new ArrayList<>();

                // --- 1. Direct Skill Compatibility (40%) ---
                if (directMatch.isPresent()) {
                    score += 40.0;
                    explanationParts.add("Teaches " + directMatch.get().getSkill().getName() + " (+40%)");
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

                if (directMatch.isPresent()) {
                    matchDto.setSkillTheyTeachYou(directMatch.get().getSkill().getName());
                    matchDto.setSkillTheyTeachYouId(directMatch.get().getSkill().getId());
                } else {
                    matchDto.setSkillTheyTeachYou("Explore Skills");
                    matchDto.setSkillTheyTeachYouId(null);
                }

                if (reverseMatch.isPresent()) {
                    matchDto.setSkillYouTeachThem(reverseMatch.get().getSkill().getName());
                    matchDto.setSkillYouTeachThemId(reverseMatch.get().getSkill().getId());
                } else {
                    // Pick any teaching skill from A to offer
                    if (!aTeaching.isEmpty()) {
                        matchDto.setSkillYouTeachThem(aTeaching.get(0).getSkill().getName());
                        matchDto.setSkillYouTeachThemId(aTeaching.get(0).getSkill().getId());
                    }
                }

                matchDto.setMutualMatch(isMutual && directMatch.isPresent());
                matchDto.setMatchPercentage(finalMatchPercent);
                matchDto.setMatchReason(String.join(" | ", explanationParts));

                results.add(matchDto);
            }
        }

        // Rank by highest match percentage first
        results.sort((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage()));
        return results;
    }
}
