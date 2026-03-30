const { submissionRepo, hackathonRepo, teamRepo } = require('../repositories');
const { formatDateTime } = require('../utils/dates');

const submissionService = {
  getAll() {
    return submissionRepo.findAll();
  },

  getById(id) {
    const submission = submissionRepo.findById(id);
    if (!submission) return null;
    submission.submitted_at_formatted = formatDateTime(submission.submitted_at);
    const scores = submissionRepo.findScores(id);
    return { submission, scores };
  },

  getNewForm(hackathonId) {
    const hackathon = hackathonRepo.findById(hackathonId);
    if (!hackathon) return null;
    const teams = teamRepo.findByHackathon(hackathonId);
    return { hackathon, teams };
  },

  create(data) {
    return submissionRepo.create(data);
  },
};

module.exports = submissionService;
