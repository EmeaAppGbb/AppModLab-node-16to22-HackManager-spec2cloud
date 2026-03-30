const { participantRepo } = require('../repositories');

const participantService = {
  getAll() {
    return participantRepo.findAll();
  },

  join(userId, teamId, hackathonId) {
    return participantRepo.create(userId, teamId, hackathonId);
  },
};

module.exports = participantService;
