import { formatRawExamsData } from "./utils";
import { ExamGenerator } from "./codeGenerator";
import { ExamName, RawExamsData } from "./types";

function getInputFromSelectedExam(
  formData: FormData,
  selectedExam: ExamName[],
) {
  // store values from user input
  const labels: ExamName[] = [];
  const valuesStore: Record<ExamName, string[]> = {
    identifikasi: [],
    skoring: [],
    triangle: [],
    "2 out of 5 pure": [],
    "2 out of 5 creamer": [],
    "2 out of 5 coklat": [],
    "treshold single": [],
    "treshold mix": [],
  };

  // get and validate total participants
  const participants = formData.get("total-participants");
  const totalParticipants = Number(participants);
  if (totalParticipants < 1 || totalParticipants > 200) {
    return { error: "Jumlah peserta minimal 1 dan maksimal 200 orang." };
  }

  // get all exam data based on selectedExam
  for (const exam of selectedExam) {
    // transform the examName from "2 out of 5 pure" to "2-out-of-5-pure"
    // and add "-values" at the end, this is important to get input form data
    const examValues = formData.getAll(`${exam.replaceAll(" ", "-")}-values`);

    if (exam.includes("2 out of 5")) {
      if (examValues.length !== 4) {
        return { error: "Nilai uji 2 out of 5 tidak lengkap." };
      }
    } else if (exam === "treshold single") {
      if (examValues.length !== 12) {
        return { error: "Nilai uji treshold single tidak lengkap." };
      }
    } else if (exam === "treshold mix") {
      if (examValues.length !== 5) {
        return { error: "Nilai uji treshold mix tidak lengkap." };
      }
    } else if (exam === "identifikasi") {
      if (examValues.length !== 5) {
        return { error: "Nilai uji identifikasi tidak lengkap." };
      }
    }

    labels.push(exam);
    valuesStore[exam] = examValues.map((value) => value.toString());
  }

  return {
    totalParticipants,
    selectedExam: labels,
    exams: valuesStore,
  };
}

export function generateExamCodes(
  formData: FormData,
  selectedExam: ExamName[],
  codeGroupName?: string,
) {
  // get exam input form data from selected exam
  const examsInput = getInputFromSelectedExam(formData, selectedExam);
  if ("error" in examsInput) {
    return { error: examsInput.error };
  }

  const examGen = new ExamGenerator(examsInput.totalParticipants);
  const results = examGen.generateExams(selectedExam, examsInput.exams);

  const listExam = examsInput.selectedExam;
  const category =
    listExam.includes("identifikasi") ||
    listExam.includes("skoring") ||
    listExam.includes("triangle")
      ? "uji produk"
      : "uji dasar";

  // detail for generated data from selected exam
  const generatedDataHeader = {
    groupName: `${category} ${codeGroupName ?? ""}`.trim(),
    selectedExam: examsInput.selectedExam,
    totalParticipants: examsInput.totalParticipants,
  };
  const rowData: RawExamsData[] = results.flatMap((exam) =>
    exam.examValues.map((data) => ({
      ...generatedDataHeader,
      examCategoryName: category,
      code: data.code,
      value: data.value,
      additionalValue: data.additionalValue,
      examName: exam.examName,
    })),
  );

  return {
    ...generatedDataHeader,
    rowExamsData: rowData,
    formatedExamsData: formatRawExamsData(rowData),
  };
}
