const { submissionRepo, judgeRepo, scoreRepo } = require('../repositories');

const judgingService = {
  getSubmissions() {
    return submissionRepo.findAll();
  },

  getSubmissionForScoring(id) {
    return submissionRepo.findById(id);
  },

  scoreSubmission(submissionId, userId, scores) {
    const submission = require('../repositories').submissionRepo.findById(submissionId);
    if (!submission) return null;

    // Resolve using the raw findById (without JOINs) for hackathon_id
    const rawSubmission = require('../config/database')
      .getDb()
      .prepare('SELECT * FROM submissions WHERE id = ?')
      .get(submissionId);
    if (!rawSubmission) return null;

    let judge = judgeRepo.findByUserAndHackathon(userId, rawSubmission.hackathon_id);
    if (!judge) {
      const result = judgeRepo.create(userId, rawSubmission.hackathon_id);
      judge = { id: result.lastInsertRowid };
    }

    const innovationScore = parseInt(scores.innovation) || 0;
    const technicalScore = parseInt(scores.technical) || 0;
    const presentationScore = parseInt(scores.presentation) || 0;
    const impactScore = parseInt(scores.impact) || 0;
    const overall = (innovationScore + technicalScore + presentationScore + impactScore) / 4;

    scoreRepo.create({
      submission_id: submissionId,
      judge_id: judge.id,
      innovation: innovationScore,
      technical: technicalScore,
      presentation: presentationScore,
      impact: impactScore,
      overall,
      comments: scores.comments,
    });

    return true;
  },
};

module.exports = judgingService;
