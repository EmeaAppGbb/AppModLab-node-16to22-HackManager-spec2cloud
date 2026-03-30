const { hackathonRepo, teamRepo, participantRepo } = require('../repositories');
const { formatHackathonDates } = require('../utils/dates');

const dashboardService = {
  getStats() {
    const totalHackathons = hackathonRepo.count();
    const totalTeams = teamRepo.count();
    const totalParticipants = participantRepo.count();
    const hackathons = hackathonRepo.findRecent(3).map(formatHackathonDates);
    return { hackathons, stats: { totalHackathons, totalTeams, totalParticipants } };
  },
};

module.exports = dashboardService;
