const { formatDate, formatDateTime, formatHackathonDates } = require('../src/utils/dates');

describe('Date utilities', () => {
  it('formatDate formats ISO date to readable format', () => {
    const result = formatDate('2024-03-15');
    expect(result).toBe('Mar 15, 2024');
  });

  it('formatDateTime includes time', () => {
    const result = formatDateTime('2024-03-15T14:30:00');
    expect(result).toContain('Mar 15, 2024');
    expect(result).toContain('2:30 PM');
  });

  it('formatHackathonDates adds formatted fields', () => {
    const hackathon = { start_date: '2024-01-01', end_date: '2024-01-31' };
    const result = formatHackathonDates(hackathon);
    expect(result.start_date_formatted).toBe('Jan 1, 2024');
    expect(result.end_date_formatted).toBe('Jan 31, 2024');
  });
});
