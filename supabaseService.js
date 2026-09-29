/**
 * STUDENT SKILL EXCHANGE PLATFORM
 * Supabase Data Persistence & Synchronization Service
 * 
 * Target Supabase Project: https://qfokonidfrpkunkuivwo.supabase.co
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qfokonidfrpkunkuivwo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;

function isConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_KEY && SUPABASE_KEY.trim().length > 0 && !SUPABASE_KEY.includes('YOUR_SUPABASE'));
}

function getClient() {
    if (!supabase && isConfigured()) {
        try {
            supabase = createClient(SUPABASE_URL.trim(), SUPABASE_KEY.trim(), {
                auth: { persistSession: false }
            });
            console.log('[SupabaseService] Client connected to: ' + SUPABASE_URL);
        } catch (e) {
            console.error('[SupabaseService] Connection initialization failed:', e.message);
            supabase = null;
        }
    }
    return supabase;
}

/**
 * Synchronize all tables from Supabase into in-memory state on startup
 */
async function syncFromSupabase(state) {
    const client = getClient();
    if (!client) {
        console.log('[SupabaseService] Skipping sync: Supabase API Key not yet supplied in .env.');
        return false;
    }

    try {
        console.log('[SupabaseService] Synchronizing data from Supabase cloud database...');

        const [
            usersRes,
            profilesRes,
            catRes,
            skillsRes,
            teachRes,
            learnRes,
            reqRes,
            exRes,
            msgRes,
            notifRes,
            verifRes,
            revRes,
            projRes,
            expRes,
            auditRes
        ] = await Promise.all([
            client.from('users').select('*'),
            client.from('student_profiles').select('*'),
            client.from('skill_categories').select('*'),
            client.from('skills').select('*'),
            client.from('user_teaching_skills').select('*'),
            client.from('user_learning_skills').select('*'),
            client.from('exchange_requests').select('*'),
            client.from('exchanges').select('*'),
            client.from('messages').select('*'),
            client.from('notifications').select('*'),
            client.from('skill_verifications').select('*'),
            client.from('reviews').select('*'),
            client.from('projects').select('*'),
            client.from('experiences').select('*'),
            client.from('audit_logs').select('*')
        ]);

        if (usersRes.data && usersRes.data.length > 0) {
            state.users = usersRes.data.map(u => ({
                id: Number(u.id),
                email: u.email,
                role: u.role,
                password: u.password,
                active: u.active,
                emailVerified: u.email_verified,
                hasSeenLanding: u.has_seen_landing
            }));
        }

        if (catRes.data && catRes.data.length > 0) {
            state.categories = catRes.data.map(c => ({
                id: Number(c.id),
                name: c.name,
                description: c.description,
                icon: c.icon
            }));
        }

        if (skillsRes.data && skillsRes.data.length > 0) {
            state.skills = skillsRes.data.map(s => ({
                id: Number(s.id),
                name: s.name,
                categoryId: Number(s.category_id),
                categoryName: s.category_name,
                description: s.description
            }));
        }

        if (profilesRes.data && profilesRes.data.length > 0) {
            const teachingByUserId = {};
            (teachRes.data || []).forEach(t => {
                const uid = Number(t.user_id);
                if (!teachingByUserId[uid]) teachingByUserId[uid] = [];
                teachingByUserId[uid].push({
                    id: Number(t.id),
                    skillId: Number(t.skill_id),
                    skillName: t.skill_name,
                    categoryId: t.category_id ? Number(t.category_id) : 1,
                    categoryName: t.category_name,
                    levelOrUrgency: t.proficiency_level || 'Intermediate',
                    verified: t.is_verified,
                    verificationStatus: t.verification_status || 'NOT_VERIFIED',
                    proofDocumentUrl: t.proof_document_url
                });
            });

            const learningByUserId = {};
            (learnRes.data || []).forEach(l => {
                const uid = Number(l.user_id);
                if (!learningByUserId[uid]) learningByUserId[uid] = [];
                learningByUserId[uid].push({
                    id: Number(l.id),
                    skillId: Number(l.skill_id),
                    skillName: l.skill_name,
                    categoryId: l.category_id ? Number(l.category_id) : 1,
                    categoryName: l.category_name,
                    levelOrUrgency: l.urgency_level || 'Medium'
                });
            });

            state.profiles = profilesRes.data.map(p => ({
                id: Number(p.id),
                userId: Number(p.user_id),
                fullName: p.full_name,
                email: p.email,
                college: p.college,
                department: p.department,
                yearOfStudy: p.year_of_study,
                phone: p.phone,
                bio: p.bio,
                avatarUrl: p.avatar_url,
                verified: p.is_verified,
                averageRating: Number(p.average_rating || 0),
                completedExchangesCount: Number(p.completed_exchanges_count || 0),
                blocked: p.is_blocked,
                teachingSkills: teachingByUserId[Number(p.user_id)] || [],
                learningSkills: learningByUserId[Number(p.user_id)] || []
            }));
        }

        if (reqRes.data && reqRes.data.length > 0) {
            state.requests = reqRes.data.map(r => ({
                id: Number(r.id),
                senderId: Number(r.sender_id),
                senderName: r.sender_name,
                senderEmail: r.sender_email,
                receiverId: Number(r.receiver_id),
                receiverName: r.receiver_name,
                skillOfferedId: Number(r.skill_offered_id),
                skillOfferedName: r.skill_offered_name,
                skillRequestedId: Number(r.skill_requested_id),
                skillRequestedName: r.skill_requested_name,
                learningMode: r.learning_mode,
                message: r.message,
                status: r.status,
                createdAt: r.created_at
            }));
        }

        if (exRes.data && exRes.data.length > 0) {
            state.exchanges = exRes.data.map(e => ({
                id: Number(e.id),
                requestId: Number(e.request_id),
                student1Id: Number(e.student1_id),
                student1Name: e.student1_name,
                student2Id: Number(e.student2_id),
                student2Name: e.student2_name,
                userAId: e.user_a_id ? Number(e.user_a_id) : Number(e.student1_id),
                userAName: e.user_a_name || e.student1_name,
                userBId: e.user_b_id ? Number(e.user_b_id) : Number(e.student2_id),
                userBName: e.user_b_name || e.student2_name,
                skill1Id: Number(e.skill1_id),
                skill1Name: e.skill1_name,
                skill2Id: Number(e.skill2_id),
                skill2Name: e.skill2_name,
                skillOfferedTitle: e.skill_offered_title,
                skillRequestedTitle: e.skill_requested_title,
                learningMode: e.learning_mode,
                status: e.status,
                startDate: e.start_date,
                completionDate: e.completion_date
            }));
        }

        if (msgRes.data && msgRes.data.length > 0) {
            state.messages = msgRes.data.map(m => ({
                id: Number(m.id),
                senderId: Number(m.sender_id),
                senderName: m.sender_name,
                receiverId: Number(m.receiver_id),
                receiverName: m.receiver_name,
                messageText: m.message_text,
                sentAt: m.sent_at,
                deliveredAt: m.delivered_at,
                seenAt: m.seen_at,
                status: m.status,
                isRead: m.is_read,
                attachmentUrl: m.attachment_url,
                attachmentType: m.attachment_type,
                attachmentName: m.attachment_name,
                attachmentSize: m.attachment_size,
                replyTo: m.reply_to
            }));
        }

        if (notifRes.data && notifRes.data.length > 0) {
            state.notifications = notifRes.data.map(n => ({
                id: Number(n.id),
                recipientId: Number(n.recipient_id),
                title: n.title,
                message: n.message,
                type: n.type,
                isRead: n.is_read,
                createdAt: n.created_at
            }));
        }

        if (verifRes.data && verifRes.data.length > 0) {
            state.verifications = verifRes.data.map(v => ({
                id: Number(v.id),
                studentId: Number(v.student_id),
                studentName: v.student_name,
                studentEmail: v.student_email,
                skillId: Number(v.skill_id),
                skillName: v.skill_name,
                certificateName: v.certificate_name,
                certificateUrl: v.certificate_url,
                projectTitle: v.project_title,
                projectDescription: v.project_description,
                projectTechnologies: v.project_technologies,
                projectLink: v.project_link,
                projectProofUrl: v.project_proof_url,
                experienceTitle: v.experience_title,
                experienceOrganization: v.experience_organization,
                experienceDescription: v.experience_description,
                experienceDuration: v.experience_duration,
                experienceStartDate: v.experience_start_date,
                experienceEndDate: v.experience_end_date,
                status: v.status,
                adminComment: v.admin_comment,
                submissionDate: v.submission_date,
                reviewedDate: v.reviewed_date
            }));
        }

        if (revRes.data && revRes.data.length > 0) {
            state.reviews = revRes.data.map(r => ({
                id: Number(r.id),
                exchangeId: Number(r.exchange_id),
                reviewerId: Number(r.reviewer_id),
                reviewerName: r.reviewer_name,
                reviewedStudentId: Number(r.reviewed_student_id),
                reviewedStudentName: r.reviewed_student_name,
                rating: Number(r.rating),
                comment: r.comment,
                createdAt: r.created_at
            }));
        }

        if (projRes.data && projRes.data.length > 0) {
            state.projects = projRes.data.map(p => ({
                id: Number(p.id),
                studentId: Number(p.student_id),
                title: p.title,
                description: p.description,
                technologies: p.technologies,
                link: p.link,
                proofUrl: p.proof_url
            }));
        }

        if (expRes.data && expRes.data.length > 0) {
            state.experiences = expRes.data.map(e => ({
                id: Number(e.id),
                studentId: Number(e.student_id),
                title: e.title,
                organization: e.organization,
                description: e.description,
                duration: e.duration,
                startDate: e.start_date,
                endDate: e.end_date,
                isCurrent: e.is_current
            }));
        }

        if (auditRes.data && auditRes.data.length > 0) {
            state.auditLogs = auditRes.data.map(a => ({
                id: Number(a.id),
                action: a.action,
                performedBy: a.performed_by,
                target: a.target,
                timestamp: a.timestamp,
                details: a.details
            }));
        }

        // Synchronize Online Sessions, Exchange Notes, Offline Progress, Offline Updates, Kitab Bhandar if tables exist
        try {
            const [onlineRes, notesRes, offlineProgRes, offlineUpRes, kitabRes] = await Promise.all([
                client.from('online_sessions').select('*'),
                client.from('exchange_notes').select('*'),
                client.from('offline_progress').select('*'),
                client.from('offline_updates').select('*'),
                client.from('kitab_bhandar').select('*')
            ]);

            if (onlineRes && onlineRes.data && onlineRes.data.length > 0) {
                state.onlineSessions = onlineRes.data.map(s => ({
                    id: Number(s.id),
                    exchangeRequestId: s.exchange_request_id ? Number(s.exchange_request_id) : null,
                    exchangeId: s.exchange_id ? Number(s.exchange_id) : null,
                    title: s.title,
                    skillId: s.skill_id ? Number(s.skill_id) : null,
                    skillName: s.skill_name,
                    teacherId: Number(s.teacher_id),
                    teacherName: s.teacher_name,
                    teacherEmail: s.teacher_email,
                    learnerId: Number(s.learner_id),
                    learnerName: s.learner_name,
                    learnerEmail: s.learner_email,
                    scheduledDate: s.scheduled_date,
                    scheduledTime: s.scheduled_time,
                    scheduledAt: s.scheduled_at,
                    durationMinutes: Number(s.duration_minutes || 60),
                    description: s.description,
                    zoomMeetingId: s.zoom_meeting_id,
                    zoomJoinUrl: s.zoom_join_url,
                    zoomPassword: s.zoom_password,
                    status: s.status,
                    createdAt: s.created_at,
                    updatedAt: s.updated_at
                }));
            }

            if (notesRes && notesRes.data && notesRes.data.length > 0) {
                state.exchangeNotes = notesRes.data.map(n => ({
                    id: Number(n.id),
                    studentId: Number(n.student_id),
                    studentName: n.student_name,
                    partnerId: Number(n.partner_id),
                    partnerName: n.partner_name,
                    exchangeRequestId: n.exchange_request_id ? Number(n.exchange_request_id) : null,
                    topic: n.topic,
                    content: n.content,
                    createdAt: n.created_at,
                    updatedAt: n.updated_at
                }));
            }

            if (offlineProgRes && offlineProgRes.data && offlineProgRes.data.length > 0) {
                state.offlineProgress = offlineProgRes.data.map(op => ({
                    id: Number(op.id),
                    exchangeRequestId: op.exchange_request_id ? Number(op.exchange_request_id) : null,
                    exchangeId: op.exchange_id ? Number(op.exchange_id) : null,
                    teacherId: Number(op.teacher_id),
                    teacherName: op.teacher_name,
                    teacherEmail: op.teacher_email,
                    learnerId: Number(op.learner_id),
                    learnerName: op.learner_name,
                    learnerEmail: op.learner_email,
                    skillOfferedTitle: op.skill_offered_title,
                    skillRequestedTitle: op.skill_requested_title,
                    learningMode: op.learning_mode || 'OFFLINE',
                    location: op.location,
                    startDate: op.start_date,
                    expectedCompletionDate: op.expected_completion_date,
                    progressPercentage: Number(op.progress_percentage || 0),
                    currentStage: op.current_stage,
                    status: op.status,
                    completionDate: op.completion_date,
                    lastActivityAt: op.last_activity_at,
                    nextActivity: op.next_activity,
                    createdAt: op.created_at,
                    updatedAt: op.updated_at
                }));
            }

            if (offlineUpRes && offlineUpRes.data && offlineUpRes.data.length > 0) {
                state.offlineUpdates = offlineUpRes.data.map(u => ({
                    id: Number(u.id),
                    offlineExchangeProgressId: Number(u.offline_exchange_progress_id),
                    submittedById: Number(u.submitted_by_id),
                    submittedByName: u.submitted_by_name,
                    sessionDate: u.session_date,
                    stage: u.stage,
                    topicsCovered: u.topics_covered,
                    description: u.description,
                    progressPercentage: Number(u.progress_percentage || 0),
                    nextActivity: u.next_activity,
                    attachmentUrl: u.attachment_url,
                    createdAt: u.created_at
                }));
            }

            if (kitabRes && kitabRes.data && kitabRes.data.length > 0) {
                state.kitabBhandar = kitabRes.data.map(b => ({
                    id: Number(b.id),
                    title: b.title,
                    author: b.author,
                    category: b.category,
                    condition: b.condition,
                    itemType: b.item_type || 'BOOK',
                    description: b.description || '',
                    ownerId: Number(b.owner_id),
                    ownerName: b.owner_name,
                    ownerEmail: b.owner_email,
                    department: b.department,
                    barterFor: b.barter_for,
                    status: b.status,
                    imageUrl: b.image_url,
                    createdAt: b.created_at
                }));
            }
        } catch (tableErr) {
            console.log('[SupabaseService] Note on extended tables sync:', tableErr.message);
        }

        console.log('[SupabaseService] Data synchronization completed successfully!');
        return true;
    } catch (err) {
        console.error('[SupabaseService] Data sync error:', err.message);
        return false;
    }
}

/**
 * Supabase Asynchronous Writers
 */

async function saveUser(user) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('users').upsert({
            id: user.id,
            email: user.email,
            password: user.password,
            role: user.role,
            active: user.active !== false,
            email_verified: user.emailVerified !== false,
            has_seen_landing: user.hasSeenLanding !== false
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveUser error:', e.message);
    }
}

async function saveProfile(profile) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('student_profiles').upsert({
            id: profile.id,
            user_id: profile.userId,
            full_name: profile.fullName,
            email: profile.email,
            college: profile.college,
            department: profile.department,
            year_of_study: profile.yearOfStudy,
            phone: profile.phone,
            bio: profile.bio,
            avatar_url: profile.avatarUrl,
            is_verified: profile.verified === true,
            average_rating: profile.averageRating || 0,
            completed_exchanges_count: profile.completedExchangesCount || 0,
            is_blocked: profile.blocked === true
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveProfile error:', e.message);
    }
}

async function saveTeachingSkill(userId, skill) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('user_teaching_skills').upsert({
            id: skill.id,
            user_id: userId,
            skill_id: skill.skillId,
            skill_name: skill.skillName,
            category_id: skill.categoryId,
            category_name: skill.categoryName,
            proficiency_level: skill.levelOrUrgency,
            is_verified: skill.verified === true,
            verification_status: skill.verificationStatus || 'NOT_VERIFIED',
            proof_document_url: skill.proofDocumentUrl || null
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveTeachingSkill error:', e.message);
    }
}

async function deleteTeachingSkill(userId, skillId) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('user_teaching_skills').delete().match({ user_id: userId, skill_id: skillId });
    } catch (e) {
        console.error('[SupabaseService] deleteTeachingSkill error:', e.message);
    }
}

async function saveLearningSkill(userId, skill) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('user_learning_skills').upsert({
            id: skill.id,
            user_id: userId,
            skill_id: skill.skillId,
            skill_name: skill.skillName,
            category_id: skill.categoryId,
            category_name: skill.categoryName,
            urgency_level: skill.levelOrUrgency
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveLearningSkill error:', e.message);
    }
}

async function deleteLearningSkill(userId, skillId) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('user_learning_skills').delete().match({ user_id: userId, skill_id: skillId });
    } catch (e) {
        console.error('[SupabaseService] deleteLearningSkill error:', e.message);
    }
}

async function saveExchangeRequest(req) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('exchange_requests').upsert({
            id: req.id,
            sender_id: req.senderId,
            sender_name: req.senderName,
            sender_email: req.senderEmail,
            receiver_id: req.receiverId,
            receiver_name: req.receiverName,
            skill_offered_id: req.skillOfferedId,
            skill_offered_name: req.skillOfferedName,
            skill_requested_id: req.skillRequestedId,
            skill_requested_name: req.skillRequestedName,
            message: req.message,
            learning_mode: req.learningMode,
            status: req.status,
            created_at: req.createdAt
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveExchangeRequest error:', e.message);
    }
}

async function saveExchange(ex) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('exchanges').upsert({
            id: ex.id,
            request_id: ex.requestId,
            student1_id: ex.student1Id || ex.userAId,
            student1_name: ex.student1Name || ex.userAName,
            student2_id: ex.student2Id || ex.userBId,
            student2_name: ex.student2Name || ex.userBName,
            user_a_id: ex.userAId,
            user_a_name: ex.userAName,
            user_b_id: ex.userBId,
            user_b_name: ex.userBName,
            skill1_id: ex.skill1Id,
            skill1_name: ex.skill1Name,
            skill2_id: ex.skill2Id,
            skill2_name: ex.skill2Name,
            skill_offered_title: ex.skillOfferedTitle,
            skill_requested_title: ex.skillRequestedTitle,
            learning_mode: ex.learningMode,
            status: ex.status,
            start_date: ex.startDate,
            completion_date: ex.completionDate || null
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveExchange error:', e.message);
    }
}

async function saveMessage(m) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('messages').upsert({
            id: m.id,
            sender_id: m.senderId,
            sender_name: m.senderName,
            receiver_id: m.receiverId,
            receiver_name: m.receiverName,
            message_text: m.messageText,
            sent_at: m.sentAt,
            delivered_at: m.deliveredAt,
            seen_at: m.seenAt,
            status: m.status,
            is_read: m.isRead,
            attachment_url: m.attachmentUrl,
            attachment_type: m.attachmentType,
            attachment_name: m.attachmentName,
            attachment_size: m.attachmentSize,
            reply_to: m.replyTo
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveMessage error:', e.message);
    }
}

async function saveNotification(n) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('notifications').upsert({
            id: n.id,
            recipient_id: n.recipientId,
            title: n.title,
            message: n.message,
            type: n.type,
            is_read: n.isRead,
            created_at: n.createdAt
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveNotification error:', e.message);
    }
}

async function saveVerification(v) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('skill_verifications').upsert({
            id: v.id,
            student_id: v.studentId,
            student_name: v.studentName,
            student_email: v.studentEmail,
            skill_id: v.skillId,
            skill_name: v.skillName,
            certificate_name: v.certificateName,
            certificate_url: v.certificateUrl,
            project_title: v.projectTitle,
            project_description: v.projectDescription,
            project_technologies: v.projectTechnologies,
            project_link: v.projectLink,
            project_proof_url: v.projectProofUrl,
            experience_title: v.experienceTitle,
            experience_organization: v.experienceOrganization,
            experience_description: v.experienceDescription,
            experience_duration: v.experienceDuration,
            experience_start_date: v.experienceStartDate,
            experience_end_date: v.experienceEndDate,
            status: v.status,
            admin_comment: v.adminComment,
            submission_date: v.submissionDate,
            reviewed_date: v.reviewedDate
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveVerification error:', e.message);
    }
}

async function saveReview(r) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('reviews').upsert({
            id: r.id,
            exchange_id: r.exchangeId,
            reviewer_id: r.reviewerId,
            reviewer_name: r.reviewerName,
            reviewed_student_id: r.reviewedStudentId,
            reviewed_student_name: r.reviewedStudentName,
            rating: r.rating,
            comment: r.comment,
            created_at: r.createdAt
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveReview error:', e.message);
    }
}

async function saveReport(rep) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('reports').upsert({
            id: rep.id,
            reporter_id: rep.reporterId,
            reported_user_id: rep.reportedUserId,
            reason: rep.reason,
            description: rep.description,
            status: rep.status,
            admin_notes: rep.adminNotes,
            created_at: rep.createdAt
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveReport error:', e.message);
    }
}

async function saveProject(p) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('projects').upsert({
            id: p.id,
            student_id: p.studentId,
            title: p.title,
            description: p.description,
            technologies: p.technologies,
            link: p.link,
            proof_url: p.proofUrl
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveProject error:', e.message);
    }
}

async function deleteProject(projectId) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('projects').delete().eq('id', projectId);
    } catch (e) {
        console.error('[SupabaseService] deleteProject error:', e.message);
    }
}

async function saveExperience(exp) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('experiences').upsert({
            id: exp.id,
            student_id: exp.studentId,
            title: exp.title,
            organization: exp.organization,
            description: exp.description,
            duration: exp.duration,
            start_date: exp.startDate,
            end_date: exp.endDate,
            is_current: exp.isCurrent === true
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveExperience error:', e.message);
    }
}

async function deleteExperience(expId) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('experiences').delete().eq('id', expId);
    } catch (e) {
        console.error('[SupabaseService] deleteExperience error:', e.message);
    }
}

async function saveAuditLog(log) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('audit_logs').upsert({
            id: log.id,
            action: log.action,
            performed_by: log.performedBy,
            target: log.target,
            timestamp: log.timestamp,
            details: log.details
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveAuditLog error:', e.message);
    }
}

async function saveOtp(email, otpHash, expiresAt, purpose = 'VERIFY') {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('otps').insert({
            email,
            otp_hash: otpHash,
            expires_at: new Date(expiresAt).toISOString(),
            purpose
        });
    } catch (e) {
        console.error('[SupabaseService] saveOtp error:', e.message);
    }
}

async function saveOnlineSession(session) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('online_sessions').upsert({
            id: session.id,
            exchange_request_id: session.exchangeRequestId,
            exchange_id: session.exchangeId,
            title: session.title,
            skill_id: session.skillId,
            skill_name: session.skillName,
            teacher_id: session.teacherId,
            teacher_name: session.teacherName,
            teacher_email: session.teacherEmail,
            learner_id: session.learnerId,
            learner_name: session.learnerName,
            learner_email: session.learnerEmail,
            scheduled_date: session.scheduledDate,
            scheduled_time: session.scheduledTime,
            scheduled_at: session.scheduledAt ? new Date(session.scheduledAt).toISOString() : null,
            duration_minutes: session.durationMinutes,
            description: session.description,
            zoom_meeting_id: session.zoomMeetingId,
            zoom_join_url: session.zoomJoinUrl,
            zoom_password: session.zoomPassword,
            status: session.status,
            created_at: session.createdAt ? new Date(session.createdAt).toISOString() : new Date().toISOString(),
            updated_at: session.updatedAt ? new Date(session.updatedAt).toISOString() : new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveOnlineSession error:', e.message);
    }
}

async function saveExchangeNote(note) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('exchange_notes').upsert({
            id: note.id,
            student_id: note.studentId,
            student_name: note.studentName,
            partner_id: note.partnerId,
            partner_name: note.partnerName,
            exchange_request_id: note.exchangeRequestId,
            topic: note.topic,
            content: note.content,
            created_at: note.createdAt ? new Date(note.createdAt).toISOString() : new Date().toISOString(),
            updated_at: note.updatedAt ? new Date(note.updatedAt).toISOString() : new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveExchangeNote error:', e.message);
    }
}

async function deleteExchangeNote(noteId) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('exchange_notes').delete().eq('id', noteId);
    } catch (e) {
        console.error('[SupabaseService] deleteExchangeNote error:', e.message);
    }
}

async function saveOfflineProgress(progress) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('offline_progress').upsert({
            id: progress.id,
            exchange_request_id: progress.exchangeRequestId,
            exchange_id: progress.exchangeId,
            teacher_id: progress.teacherId,
            teacher_name: progress.teacherName,
            teacher_email: progress.teacherEmail,
            learner_id: progress.learnerId,
            learner_name: progress.learnerName,
            learner_email: progress.learnerEmail,
            skill_offered_title: progress.skillOfferedTitle,
            skill_requested_title: progress.skillRequestedTitle,
            learning_mode: progress.learningMode || 'OFFLINE',
            location: progress.location,
            start_date: progress.startDate ? new Date(progress.startDate).toISOString() : null,
            expected_completion_date: progress.expectedCompletionDate ? new Date(progress.expectedCompletionDate).toISOString() : null,
            progress_percentage: progress.progressPercentage,
            current_stage: progress.currentStage,
            status: progress.status,
            completion_date: progress.completionDate ? new Date(progress.completionDate).toISOString() : null,
            last_activity_at: progress.lastActivityAt ? new Date(progress.lastActivityAt).toISOString() : new Date().toISOString(),
            next_activity: progress.nextActivity,
            created_at: progress.createdAt ? new Date(progress.createdAt).toISOString() : new Date().toISOString(),
            updated_at: progress.updatedAt ? new Date(progress.updatedAt).toISOString() : new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveOfflineProgress error:', e.message);
    }
}

async function saveOfflineUpdate(update) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('offline_updates').upsert({
            id: update.id,
            offline_exchange_progress_id: update.offlineExchangeProgressId,
            submitted_by_id: update.submittedById,
            submitted_by_name: update.submittedByName,
            session_date: update.sessionDate,
            stage: update.stage,
            topics_covered: update.topicsCovered,
            description: update.description,
            progress_percentage: update.progressPercentage,
            next_activity: update.nextActivity,
            attachment_url: update.attachmentUrl,
            created_at: update.createdAt ? new Date(update.createdAt).toISOString() : new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveOfflineUpdate error:', e.message);
    }
}

async function saveKitabListing(listing) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('kitab_bhandar').upsert({
            id: listing.id,
            title: listing.title,
            author: listing.author,
            category: listing.category,
            condition: listing.condition,
            item_type: listing.itemType || 'BOOK',
            description: listing.description || '',
            owner_id: listing.ownerId,
            owner_name: listing.ownerName,
            owner_email: listing.ownerEmail,
            department: listing.department,
            barter_for: listing.barterFor,
            status: listing.status,
            image_url: listing.imageUrl,
            created_at: listing.createdAt ? new Date(listing.createdAt).toISOString() : new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (e) {
        console.error('[SupabaseService] saveKitabListing error:', e.message);
    }
}

async function deleteKitabListing(listingId) {
    const client = getClient();
    if (!client) return;
    try {
        await client.from('kitab_bhandar').delete().eq('id', listingId);
    } catch (e) {
        console.error('[SupabaseService] deleteKitabListing error:', e.message);
    }
}

module.exports = {
    isConfigured,
    getClient,
    syncFromSupabase,
    saveUser,
    saveProfile,
    saveTeachingSkill,
    deleteTeachingSkill,
    saveLearningSkill,
    deleteLearningSkill,
    saveProject,
    deleteProject,
    saveExperience,
    deleteExperience,
    saveExchangeRequest,
    saveExchange,
    saveMessage,
    saveNotification,
    saveVerification,
    saveReview,
    saveReport,
    saveAuditLog,
    saveOtp,
    saveOnlineSession,
    saveExchangeNote,
    deleteExchangeNote,
    saveOfflineProgress,
    saveOfflineUpdate,
    saveKitabListing,
    deleteKitabListing
};
