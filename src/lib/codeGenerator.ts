export class ExamGenerator {
  private numberOfTwoOutOfFiveGlass = 5;
  private numberOfTresholdSingleGlass = 12;
  private numberOfTresholdMixGlass = 5;
  private numberOfIdentificationGlass = 5;
  private numberOfTriangleGlass = 3;
  private numberOfScoringGlass = 5;
  private totalParticipants: number; // maximum number of participants = 200

  constructor(totalParticipants: number) {
    this.totalParticipants = totalParticipants;
  }

  private pairCodesWithValues(
    codes: string[],
    values: string[],
    additionalValues?: string[],
  ) {
    const result: { code: string; value: string; additionalValue?: string }[] =
      [];

    // evenly pair random codes with values
    codes.forEach((code, index) => {
      const value = values[index % values.length];
      const additionalValue = additionalValues
        ? additionalValues[index % values.length]
        : "";
      result.push({ code, value, additionalValue });
    });

    return result;
  }

  private generateRandomFourDigitCode(): string {
    // generate a random 4-digit code, range 1000–9999
    return (Math.floor(Math.random() * 9000) + 1000).toString();
  }

  private getTotalCodesNeeded(exams: string[]): number {
    let totalGlassNeeded = 0;

    for (const exam of exams) {
      const examLowerCase = exam.toLowerCase();
      if (examLowerCase.includes("2 out of 5")) {
        totalGlassNeeded += this.numberOfTwoOutOfFiveGlass;
      } else if (examLowerCase.includes("treshold single")) {
        totalGlassNeeded += this.numberOfTresholdSingleGlass;
      } else if (examLowerCase.includes("treshold mix")) {
        totalGlassNeeded += this.numberOfTresholdMixGlass;
      } else if (examLowerCase.includes("identifikasi")) {
        totalGlassNeeded += this.numberOfIdentificationGlass;
      } else if (examLowerCase.includes("triangle")) {
        totalGlassNeeded += this.numberOfTriangleGlass;
      } else if (examLowerCase.includes("skoring")) {
        totalGlassNeeded += this.numberOfScoringGlass;
      }
    }

    return totalGlassNeeded * this.totalParticipants;
  }

  // implementation for 2 out of 5 test code generation
  private generateTwoOutOfFiveCodes(codes: string[], values: string[]) {
    if (codes.length % this.numberOfTwoOutOfFiveGlass !== 0) return [];

    // there are 2 codes with the same value and 3 codes with different values
    const numberOfSameValueCodes = this.totalParticipants * 2;
    const numberOfDifferentValueCodes = this.totalParticipants * 3;

    const sameValueCodes = codes.slice(0, numberOfSameValueCodes);
    const differentValueCodes = codes.slice(
      numberOfSameValueCodes,
      numberOfSameValueCodes + numberOfDifferentValueCodes,
    );

    // product for same-value codes is always at index 0,
    // products for different-value codes are at index 1–3
    const sameValueProducts = [values[0]];
    const differentValueProducts = values.slice(1);

    const sameValueObjects = this.pairCodesWithValues(
      sameValueCodes,
      ["sama"],
      sameValueProducts,
    );
    const differentValueObjects = this.pairCodesWithValues(
      differentValueCodes,
      ["beda", "beda", "beda"],
      differentValueProducts,
    );

    return [...sameValueObjects, ...differentValueObjects];
  }

  // implementation for treshold single test code generation
  private generateTresholdSingleCodes(codes: string[], values: string[]) {
    if (codes.length % this.numberOfTresholdSingleGlass !== 0) return [];
    const valuesList = values.map((val) => val.split("+")[0]);
    const additionalValues = values.map((val) => val.split("+")[1]);

    return this.pairCodesWithValues(codes, valuesList, additionalValues);
  }

  // implementation for treshold mix test code generation
  private generateTresholdMixCodes(codes: string[], values: string[]) {
    if (codes.length % this.numberOfTresholdMixGlass !== 0) return [];

    return this.pairCodesWithValues(codes, values);
  }

  // implementation for identification test code generation
  private generateIdentificationCodes(codes: string[], values: string[]) {
    if (codes.length % this.numberOfIdentificationGlass !== 0) return [];

    return this.pairCodesWithValues(codes, values);
  }

  // implementation for triangle test code generation
  private generateTriangleCodes(codes: string[]) {
    if (codes.length % this.numberOfTriangleGlass !== 0) return [];

    // there are 2 codes with the same value and 1 code with a different value
    // participants are asked to choose which code has a different value
    const numberOfSameValueCodes = this.totalParticipants * 2;
    const numberOfDifferentValueCodes = this.totalParticipants;

    const sameValueCodes = codes
      .slice(0, numberOfSameValueCodes)
      .map((code) => ({ code, value: "sama", additionalValue: undefined }));

    const differentValueCodes = codes
      .slice(
        numberOfSameValueCodes,
        numberOfSameValueCodes + numberOfDifferentValueCodes,
      )
      .map((code) => ({ code, value: "beda", additionalValue: undefined }));

    return [...sameValueCodes, ...differentValueCodes];
  }

  // implementation for scoring test code generation
  private generateScoringCodes(codes: string[]) {
    if (codes.length % this.numberOfScoringGlass !== 0) return [];

    const scoringValues = ["1.5", "2", "3", "4", "5"];
    return this.pairCodesWithValues(codes, scoringValues);
  }

  generateExams(selectedExam: string[], valuesStore: Record<string, string[]>) {
    const totalCodesNeeded = this.getTotalCodesNeeded(selectedExam);

    // generate unique 4-digit codes
    const codes = new Set<string>();
    while (codes.size !== totalCodesNeeded) {
      codes.add(this.generateRandomFourDigitCode());
    }

    const allCodes = Array.from(codes);
    let cursor = 0;
    const results: {
      examName: string;
      examValues: { value: string; code: string; additionalValue?: string }[];
    }[] = [];

    for (const exam of selectedExam) {
      const examLower = exam.toLowerCase();
      let examResult: {
        code: string;
        value: string;
        additionalValue?: string;
      }[] = [];

      if (examLower.includes("2 out of 5")) {
        const needed = this.totalParticipants * this.numberOfTwoOutOfFiveGlass;
        examResult = this.generateTwoOutOfFiveCodes(
          allCodes.slice(cursor, cursor + needed),
          valuesStore[examLower],
        );
        cursor += needed;
      } else if (examLower === "treshold single") {
        const needed =
          this.totalParticipants * this.numberOfTresholdSingleGlass;
        examResult = this.generateTresholdSingleCodes(
          allCodes.slice(cursor, cursor + needed),
          valuesStore[examLower],
        );
        cursor += needed;
      } else if (examLower === "treshold mix") {
        const needed = this.totalParticipants * this.numberOfTresholdMixGlass;
        examResult = this.generateTresholdMixCodes(
          allCodes.slice(cursor, cursor + needed),
          valuesStore[examLower],
        );
        cursor += needed;
      } else if (examLower === "triangle") {
        const needed = this.totalParticipants * this.numberOfTriangleGlass;
        examResult = this.generateTriangleCodes(
          allCodes.slice(cursor, cursor + needed),
        );
        cursor += needed;
      } else if (examLower === "skoring") {
        const needed = this.totalParticipants * this.numberOfScoringGlass;
        examResult = this.generateScoringCodes(
          allCodes.slice(cursor, cursor + needed),
        );
        cursor += needed;
      } else if (examLower === "identifikasi") {
        const needed =
          this.totalParticipants * this.numberOfIdentificationGlass;
        examResult = this.generateIdentificationCodes(
          allCodes.slice(cursor, cursor + needed),
          valuesStore[examLower],
        );
        cursor += needed;
      }

      results.push({ examName: examLower, examValues: examResult });
    }

    return results;
  }
}
