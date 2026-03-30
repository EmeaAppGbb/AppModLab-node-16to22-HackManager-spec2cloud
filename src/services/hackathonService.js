const { hackathonRepo, teamRepo, submissionRepo } = require('../repositories');
const { formatHackathonDates } = require('../utils/dates');

const hackathonService = {
  getAll() {
    return hackathonRepo.findAll().map(formatHackathonDates);
  },

  getById(id) {
    const hackathon = hackathonRepo.findById(id);
    if (!hackathon) return null;
    formatHackathonDates(hackathon);
    const teams = teamRepo.findByHackathon(id);
    const submissions = submissionRepo.findByHackathon(id);
    return { hackathon, teams, submissions };
  },

  create(data) {
    return hackathonRepo.create(data);
  },

  update(id, data) {
    return hackathonRepo.update(id, data);
  },

  delete(id) {
    return hackathonRepo.delete(id);
  },
};

module.exports = hackathonService;
