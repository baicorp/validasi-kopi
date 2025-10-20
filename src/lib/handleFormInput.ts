import { basicExam } from "./constant";
import { RawExamsData } from "./types";
import { formatRawExamsData } from "./utils";
import { ExamGenerator } from "./codeGenerator";

function getInputFromSelectedExam(formData: FormData, selectedExam: string[]) {
  // store values from user input
  const labels: string[] = [];
  const valuesStore: Record<string, string[]> = {};

  // get and validate total participants
  const participants = formData.get("total-participants");
  const totalParticipants = Number(participants);
  if (totalParticipants < 1 || totalParticipants > 200) {
    return { error: "Jumlah peserta minimal 1 dan maksimal 200 orang." };
  }

  // get all exam data based on selectedExam
  for (const exam of selectedExam) {
    const examLowerCase = exam.toLowerCase();
    // transform the examName from "2 out of 5 kopi pure" to "2-out-of-5-kopi-pure"
    // and add "-values" at the end, this is important to get input form data
    const examValues = formData.getAll(
      `${examLowerCase.replaceAll(" ", "-")}-values`,
    );

    if (examLowerCase.includes("2 out of 5")) {
      if (examValues.length !== 4) {
        return { error: "Nilai uji 2 out of 5 tidak lengkap." };
      }
    } else if (examLowerCase === "treshold single") {
      if (examValues.length !== 12) {
        return { error: "Nilai uji treshold single tidak lengkap." };
      }
    } else if (examLowerCase === "treshold mix") {
      if (examValues.length !== 5) {
        return { error: "Nilai uji treshold mix tidak lengkap." };
      }
    } else if (examLowerCase === "identifikasi") {
      if (examValues.length !== 5) {
        return { error: "Nilai uji identifikasi tidak lengkap." };
      }
    }

    labels.push(examLowerCase);
    valuesStore[examLowerCase] = examValues.map((value) => value.toString());
  }

  return {
    totalParticipants,
    examsLabel: labels.join(","),
    exams: valuesStore,
  };
}

export function generateExamCodes(
  formData: FormData,
  selectedExam: string[],
  codeGroupName?: string,
) {
  // get exam input form data from selected exam
  const examsInput = getInputFromSelectedExam(formData, selectedExam);
  if ("error" in examsInput) {
    return { error: examsInput.error };
  }

  const examGen = new ExamGenerator(examsInput.totalParticipants);
  const results = examGen.generateExams(selectedExam, examsInput.exams);

  const category = basicExam.includes(examsInput.examsLabel.split(",")[0])
    ? "uji dasar"
    : "uji produk";

  // detail for generated data from selected exam
  const generatedDataHeader = {
    groupName: `${category} ${codeGroupName ?? ""}`.trim(),
    examsLabel: examsInput.examsLabel,
    totalParticipants: examsInput.totalParticipants,
  };
  const rowData: RawExamsData[] = results.flatMap((exam) =>
    exam.examValues.map((data) => ({
      ...generatedDataHeader,
      examCategoryName: category,
      code: data.code,
      value: data.value,
      examName: exam.examName,
    })),
  );

  return {
    ...generatedDataHeader,
    examsData: rowData,
    formatedExamsData: formatRawExamsData(rowData),
  };
}
