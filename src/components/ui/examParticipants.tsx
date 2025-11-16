"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { Label } from "./label";
import ErrorComp from "./error";
import { Input } from "./input";
import { useState } from "react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import Loading from "../skeleton/loading";
import { Participants } from "@/lib/types";
import { LoaderCircle } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { getAllEmployees } from "@/actions/employees";
import { assignUser } from "@/actions/examRegistrations";

export default function ExamParticipants({
  examEventId,
  listParticipant,
  totalParticipants,
}: {
  examEventId: number;
  listParticipant: Participants[];
  totalParticipants: number;
}) {
  const [input, setInput] = useState("");
  const [isLoad, setIsload] = useState(false);
  const searchInput = useDebounce(input);
  const [participants, setParticipants] = useState<Participants[]>(
    listParticipant ?? [],
  );

  const {
    data: employees,
    isLoading: isLoadingEmployees,
    error: errorEmployees,
  } = useSWR(searchInput, () => getAllEmployees(1, searchInput));

  function handleCheckChange(
    employee: Participants,
    checked: boolean | "indeterminate",
  ) {
    if (checked === true) {
      setParticipants((prev) => {
        const exists = prev.some((p) => p.id === employee.id);
        if (!exists) return [...prev, employee];
        return prev;
      });
    } else {
      setParticipants((prev) => prev.filter((p) => p.id !== employee.id));
    }
  }

  async function handleSaveParticipant() {
    setIsload(true);
    const result = await assignUser(participants, examEventId);
    if ("error" in result) {
      toast.error(result.error);
      setIsload(false);
      return;
    }
    toast.success("Berhasil menambahkan peserta ujian");
    setIsload(false);
  }

  return (
    <>
      <div>
        <p className="font-semibold">
          DAFTAR PESERTA ({participants.length}/{totalParticipants})
        </p>
        <p className="text-muted-foreground mb-1">
          Masukkan daftar peserta yang mengikuti ujian ini
        </p>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Masukkan nama / NIK"
        />
        {input && (
          <div className="mt-2 py-4  bg-white border rounded-lg shadow px-6">
            {isLoadingEmployees ? (
              <div className="flex justify-center">
                <Loading />
              </div>
            ) : errorEmployees ? (
              <ErrorComp error={errorEmployees} />
            ) : employees?.data?.length === 0 ? (
              <p className="text-muted-foreground text-center text-sm">
                Karyawan tidak ditemukn
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {employees?.data?.map((employee) => {
                  return (
                    <div key={employee.id} className="flex gap-2 p-1">
                      <Checkbox
                        id={employee.id}
                        checked={participants.some(
                          (participant) => participant.id === employee.id,
                        )}
                        onCheckedChange={(checked) =>
                          handleCheckChange(employee, checked)
                        }
                        className="mt-1"
                      />
                      <Label
                        className="flex flex-col items-start text-base"
                        htmlFor={employee.id}
                      >
                        <p>{employee.name}</p>
                        <p className="text-sm text-muted-foreground m-0 p-0 leading-1.5">
                          {employee.username}
                        </p>
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      {participants.length !== 0 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {participants.map((participant) => (
              <ExamParticipantItem
                key={participant.username}
                name={participant.name}
                username={participant.username}
              />
            ))}
          </div>
          <Button
            onClick={handleSaveParticipant}
            disabled={isLoad}
            className="ml-auto"
          >
            Simpan
            {isLoad && <LoaderCircle className="animate-spin" />}
          </Button>
        </>
      )}
    </>
  );
}

function ExamParticipantItem({
  username,
  name,
}: {
  username: string;
  name: string;
}) {
  return (
    <div className="flex flex-col p-2.5 rounded-md border shadow">
      <p className="font-medium">{name}</p>
      <div className="flex gap-2 items-center text-muted-foreground">
        <p className="font-mono text-sm">{username}</p>
        <span>•</span>
        <p className="text-sm">QC</p>
      </div>
    </div>
  );
}
