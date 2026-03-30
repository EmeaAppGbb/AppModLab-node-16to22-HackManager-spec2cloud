const { teamRepo, hackathonRepo } = require('../repositories');

const teamService = {
  getAll() {
    return teamRepo.findAll();
  },

  getById(id) {
    const team = teamRepo.findById(id);
    if (!team) return null;
    const members = teamRepo.findMembers(id);
    const hackathon = hackathonRepo.findById(team.hackathon_id);
    return { team, members, hackathon };
  },

  getNewTeamForm(hackathonId) {
    return hackathonRepo.findById(hackathonId);
  },

  create(data) {
    return teamRepo.create(data);
  },
};

module.exports = teamService;
