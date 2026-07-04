const Attendance = require('./Attendance');

const round = (n) => Math.round(n * 100) / 100;

class Salary {
  /**
   * Automated Salary Calculation Engine (per PRD §2).
   *
   * @param {number} totalWage         – CTC / Total Wage per month
   * @param {number} unpaidLeaveDays   – days absent without approved leave
   * @param {number} workingDaysInMonth – standard working days (default 22)
   * @returns {object} full breakdown
   */
  static calculate(totalWage, unpaidLeaveDays = 0, workingDaysInMonth = 22) {
    const baseSalary        = totalWage * 0.50;
    const hra               = baseSalary * 0.40;
    const performanceBonus  = baseSalary * 0.10;
    const lta               = baseSalary * 0.05;
    const foodAllowance     = baseSalary * 0.05;
    const medicalAllowance  = 1250.00;          // fixed

    // Deductions
    const pfContribution    = baseSalary * 0.12;
    const professionalTax   = 200.00;           // fixed

    // Attendance impact
    const perDayWage           = totalWage / workingDaysInMonth;
    const attendanceDeduction  = perDayWage * unpaidLeaveDays;

    const grossEarnings   = baseSalary + hra + performanceBonus + lta + foodAllowance + medicalAllowance;
    const totalDeductions = pfContribution + professionalTax + attendanceDeduction;
    const netSalary       = grossEarnings - totalDeductions;

    return {
      totalWage:            round(totalWage),
      baseSalary:           round(baseSalary),
      hra:                  round(hra),
      performanceBonus:     round(performanceBonus),
      lta:                  round(lta),
      foodAllowance:        round(foodAllowance),
      medicalAllowance:     round(medicalAllowance),
      grossEarnings:        round(grossEarnings),
      pfContribution:       round(pfContribution),
      professionalTax:      round(professionalTax),
      attendanceDeduction:  round(attendanceDeduction),
      unpaidLeaveDays,
      workingDaysInMonth,
      totalDeductions:      round(totalDeductions),
      netSalary:            round(netSalary),
    };
  }

  /**
   * Convenience: compute payroll for a specific employee + month,
   * automatically pulling their unpaid-leave count.
   */
  static getEmployeePayroll(userId, totalWage, year, month) {
    const unpaid = Attendance.getUnpaidLeaveDays(userId, year, month);
    return this.calculate(totalWage, unpaid);
  }
}

module.exports = Salary;
