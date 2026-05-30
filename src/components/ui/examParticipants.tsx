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
import { useParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { LoaderCircle, XSquare } from "lucide-react";
import { getAllEmployees } from "@/actions/employees";
import { assignUser } from "@/actions/examRegistrations";

export default function ExamParticipants({
  listParticipant,
}: {
  listParticipant: Participants[];
}) {
  const { examEventId } = useParams<{ examEventId: string }>();
  const [isLoad, setIsload] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState(listParticipant);
  const [participants, setParticipants] = useState(listParticipant);

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

  function isParticipantChanged() {
    if (registeredUsers.length !== participants.length) return true;
    const registeredUsersSet = new Set(
      registeredUsers.map((person) => person.id),
    );
    return !participants.every((person) => registeredUsersSet.has(person.id));
  }

  async function handleSaveParticipant() {
    setIsload(true);
    const result = await assignUser(participants, examEventId);
    if ("error" in result) {
      toast.error(result.error);
      setIsload(false);
      return;
    }
    toast.success(
      isParticipantChanged() && registeredUsers.length !== 0
        ? "Berhasil memperbarui daftar peserta ujian"
        : "Berhasil menambahkan peserta ujian",
    );
    setRegisteredUsers(participants);
    setIsload(false);
  }

  return (
    <div>
      <SearchParticipants
        participants={participants}
        handleCheckChange={handleCheckChange}
      />
      <div className="mt-2">
        {participants.length === 0 ? (
          <p className="text-muted-foreground text-center text-sm mt-2">
            {registeredUsers.length !== 0
              ? null
              : "Belum ada peserta yang ditambahkan."}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {participants.map((participant) => (
              <ExamParticipantItem
                key={participant.id}
                id={participant.id}
                name={participant.name}
                username={participant.username}
                department={participant.department}
                handleRemoveParticipant={handleCheckChange}
              />
            ))}
          </div>
        )}
      </div>
      <div className="space-x-2">
        <Button
          onClick={handleSaveParticipant}
          disabled={
            isLoad ||
            !isParticipantChanged() ||
            (participants.length === 0 && registeredUsers.length === 0)
          }
          className="ml-auto mt-2"
        >
          Simpan{" "}
          {isParticipantChanged() &&
            registeredUsers.length !== 0 &&
            "perubahan"}
          {isLoad && <LoaderCircle className="animate-spin" />}
        </Button>
        {isParticipantChanged() && (
          <Button
            onClick={() => setParticipants(registeredUsers)}
            className="ml-auto mt-2"
            variant="outline"
            disabled={isLoad}
          >
            Batalkan perubahan
          </Button>
        )}
      </div>
    </div>
  );
}

function ExamParticipantItem({
  id,
  username,
  name,
  department,
  handleRemoveParticipant,
}: Participants & {
  handleRemoveParticipant: (
    employee: Participants,
    checked: boolean | "indeterminate",
  ) => void;
}) {
  return (
    <div className="p-2.5 rounded-md border shadow hover:scale-[1.02] transition-all">
      <div className="flex justify-between">
        <p className="font-medium pr-2">{name}</p>
        <button
          onClick={() =>
            handleRemoveParticipant({ id, username, name, department }, false)
          }
        >
          <XSquare size={16} />
        </button>
      </div>
      <div className="flex gap-2 items-center text-muted-foreground">
        <p className="font-mono text-sm">{username}</p>
        <span>•</span>
        <p className="text-sm">{department}</p>
      </div>
    </div>
  );
}

function SearchParticipants({
  participants,
  handleCheckChange,
}: {
  participants: Participants[];
  handleCheckChange(
    employee: Participants,
    checked: boolean | "indeterminate",
  ): void;
}) {
  const [input, setInput] = useState("");
  const searchInput = useDebounce(input);
  const {
    data: employees,
    isLoading,
    error,
  } = useSWR(searchInput, () => getAllEmployees(1, searchInput));

  if (error || employees?.error) {
    return (
      <ErrorComp
        error={employees?.error || "Gagal mendapatkan data karyawan"}
      />
    );
  }

  return (
    <div>
      <p className="font-semibold">DAFTAR PESERTA ({participants.length})</p>
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
          {isLoading ? (
            <Loading />
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
  );
}
