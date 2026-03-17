import { useState } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Select,
  NumberInput,
  Group,
  Button,
  SimpleGrid
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCreateEmployee } from "@/api/useEmployee";
import type { CompanyOption } from "@/types/Company.model";

const CONTRACT_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
  { value: "freelance", label: "Freelance" }
];

interface Props {
  opened: boolean;
  onClose: () => void;
  companies: CompanyOption[];
  defaultCompanyId?: string | null;
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  employeeNumber: "",
  position: "",
  department: "",
  hireDate: "",
  companyId: "",
  phoneNumber: "",
  contractType: "" as string | null,
  salary: undefined as number | undefined,
  workingHoursPerWeek: undefined as number | undefined
};

export function CreateEmployeeModal({
  opened,
  onClose,
  companies,
  defaultCompanyId
}: Props) {
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const createEmployee = useCreateEmployee();

  const set = (field: keyof typeof EMPTY_FORM) => (value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setStr =
    (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.currentTarget.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const companyId = form.companyId || defaultCompanyId || "";
    if (!companyId) {
      notifications.show({
        title: "Error",
        message: "Please select a company",
        color: "red"
      });
      return;
    }
    createEmployee.mutate(
      {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        employeeNumber: form.employeeNumber,
        position: form.position,
        department: form.department,
        hireDate: form.hireDate,
        companyId,
        ...(form.phoneNumber ? { phoneNumber: form.phoneNumber } : {}),
        ...(form.contractType ? { contractType: form.contractType } : {}),
        ...(form.salary !== undefined ? { salary: form.salary } : {}),
        ...(form.workingHoursPerWeek !== undefined
          ? { workingHoursPerWeek: form.workingHoursPerWeek }
          : {})
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Employee created",
            message: `${form.firstName} ${form.lastName} has been added.`,
            color: "green"
          });
          setForm({ ...EMPTY_FORM });
          onClose();
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to create employee";
          notifications.show({ title: "Error", message: msg, color: "red" });
        }
      }
    );
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    onClose();
  };

  const companyOptions = companies.map((c) => ({
    value: c.id,
    label: c.name
  }));

  // Always require an explicit company selection
  const effectiveCompanyId = form.companyId || defaultCompanyId || "";

  return (
    <Modal opened={opened} onClose={handleClose} size="lg" title="New Employee">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <TextInput
              label="First name"
              required
              value={form.firstName}
              onChange={setStr("firstName")}
            />
            <TextInput
              label="Last name"
              required
              value={form.lastName}
              onChange={setStr("lastName")}
            />
          </SimpleGrid>

          <TextInput
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={setStr("email")}
          />

          <SimpleGrid cols={2}>
            <TextInput
              label="Employee number"
              required
              value={form.employeeNumber}
              onChange={setStr("employeeNumber")}
            />
            <TextInput
              label="Hire date"
              type="date"
              required
              value={form.hireDate}
              onChange={setStr("hireDate")}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput
              label="Position"
              required
              value={form.position}
              onChange={setStr("position")}
            />
            <TextInput
              label="Department"
              required
              value={form.department}
              onChange={setStr("department")}
            />
          </SimpleGrid>

          <Select
            label="Company"
            required
            placeholder="Select company"
            data={companyOptions}
            value={form.companyId || defaultCompanyId || null}
            onChange={set("companyId")}
            searchable
          />

          <SimpleGrid cols={2}>
            <TextInput
              label="Phone number"
              value={form.phoneNumber}
              onChange={setStr("phoneNumber")}
            />
            <Select
              label="Contract type"
              data={CONTRACT_TYPE_OPTIONS}
              value={form.contractType}
              onChange={set("contractType")}
              clearable
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <NumberInput
              label="Salary"
              min={0}
              value={form.salary}
              onChange={(v) => set("salary")(v === "" ? undefined : v)}
            />
            <NumberInput
              label="Hours / week"
              min={0}
              max={168}
              value={form.workingHoursPerWeek}
              onChange={(v) =>
                set("workingHoursPerWeek")(v === "" ? undefined : v)
              }
            />
          </SimpleGrid>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createEmployee.isPending}
              disabled={
                !form.firstName ||
                !form.lastName ||
                !form.email ||
                !form.employeeNumber ||
                !form.position ||
                !form.department ||
                !form.hireDate ||
                !effectiveCompanyId
              }
            >
              Create employee
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
