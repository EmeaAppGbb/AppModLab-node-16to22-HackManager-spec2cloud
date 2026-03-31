const { submissionRepo, hackathonRepo } = require('../repositories');

const leaderboardService = {
  getLeaderboard(hackathonId) {
    const entries = submissionRepo.findLeaderboard(hackathonId || undefined);

    let rank = 0;
    let prevScore = null;
    return entries.map((entry, index) => {
      if (entry.judge_count === 0) {
        return { ...entry, rank: null };
      }
      if (entry.avg_overall !== prevScore) {
        rank = index + 1;
        prevScore = entry.avg_overall;
      }
      return { ...entry, rank };
    });
  },

  getHackathons() {
    return hackathonRepo.findAll();
  },
};

module.exports = leaderboardService;
