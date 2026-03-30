const bcrypt = require('bcryptjs');
const { userRepo } = require('../repositories');

const authService = {
  async authenticate(username, password) {
    const user = userRepo.findByUsername(username);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return { id: user.id, username: user.username, email: user.email, role: user.role };
  },

  async register(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return userRepo.create(username, email, hashedPassword, 'participant');
  },
};

module.exports = authService;
