import { IPothole } from '../models/Pothole.model';

export class SeverityService {
  // Weights for severity calculation
  private static WEIGHTS = {
    avgImpact: 0.3,
    maxImpact: 0.5,
    frequency: 0.2,
  };

  // Normalization ranges
  private static MAX_MAGNITUDE = 3.0; // 3g is extreme impact
  private static MAX_FREQUENCY = 50; // 50 unique reports is very high

  /**
   * Calculate severity score (0-100) based on impact and frequency
   * Higher magnitude + more reports = higher severity
   */
  static calculateSeverity(pothole: IPothole): number {
    // Normalize average magnitude (0-1)
    const avgNorm = Math.min(
      pothole.impactData.avgMagnitude / this.MAX_MAGNITUDE,
      1
    );

    // Normalize max magnitude (0-1)
    const maxNorm = Math.min(
      pothole.impactData.maxMagnitude / this.MAX_MAGNITUDE,
      1
    );

    // Normalize frequency (0-1)
    const freqNorm = Math.min(pothole.reports / this.MAX_FREQUENCY, 1);

    // Weighted sum
    const severity =
      this.WEIGHTS.avgImpact * avgNorm +
      this.WEIGHTS.maxImpact * maxNorm +
      this.WEIGHTS.frequency * freqNorm;

    return Math.round(severity * 100); // Scale to 0-100
  }

  /**
   * Update pothole severity and save to database
   */
  static async updateSeverity(pothole: IPothole): Promise<void> {
    pothole.severity = this.calculateSeverity(pothole);
    await pothole.save();
  }
}
