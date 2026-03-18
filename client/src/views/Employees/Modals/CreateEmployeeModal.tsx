import { useEffect } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { useCreateEmployee } from "@/hooks/useEmployee";
import type { CompanyOption } from "@/types/Company.model";
import { CONTRACT_TYPE_OPTIONS } from "@/utils/constants";

interface Props {
  opened: boolean;
  onClose: () => void;
  companies: CompanyOption[];
  defaultCompanyId?: string | null;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
  position: string;
  department: string;
  hireDate: string;
  companyId: string;
  phoneNumber: string;
  contractType: string | null;
  salary: number | null;
  workingHoursPerWeek: number | null;
}

export function CreateEmployeeModal({
  opened,
  onClose,
  companies,
  defaultCompanyId
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      employeeNumber: "",
      position: "",
      department: "",
      hireDate: "",
      companyId: "",
      phoneNumber: "",
      contractType: null,
      salary: null,
      workingHoursPerWeek: null
    }
  });

  const createEmployee = useCreateEmployee();

  useEffect(() => {
    if (!opened) reset();
  }, [opened, reset]);

  const onSubmit = (data: FormValues) => {
    const companyId = data.companyId || defaultCompanyId || "";
    createEmployee.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        employeeNumber: data.employeeNumber,
        position: data.position,
        department: data.department,
        hireDate: data.hireDate,
        companyId,
        phoneNumber: data.phoneNumber || undefined,
        contractType: data.contractType || undefined,
        salary: data.salary ?? undefined,
        workingHoursPerWeek: data.workingHoursPerWeek ?? undefined
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Employee created",
            message: `${data.firstName} ${data.lastName} has been added.`,
            color: "green"
          });
          reset();
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
    reset();
    onClose();
  };

  const companyOptions = companies.map((c) => ({
    value: c.id,
    label: c.name
  }));

  return (
    <Modal opened={opened} onClose={handleClose} size="lg" title="New Employee">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <TextInput
              label="First name"
              required
              error={errors.firstName?.message}
              {...register("firstName", { required: "First name is required" })}
            />
            <TextInput
              label="Last name"
              required
              error={errors.lastName?.message}
              {...register("lastName", { required: "Last name is required" })}
            />
          </SimpleGrid>

          <TextInput
            label="Email"
            type="email"
            required
            error={errors.email?.message}
            {...register("email", { required: "Email is required" })}
          />

          <SimpleGrid cols={2}>
            <TextInput
              label="Employee number"
              required
              error={errors.employeeNumber?.message}
              {...register("employeeNumber", {
                required: "Employee number is required"
              })}
            />
            <TextInput
              label="Hire date"
              type="date"
              required
              error={errors.hireDate?.message}
              {...register("hireDate", { required: "Hire date is required" })}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput
              label="Position"
              required
              error={errors.position?.message}
              {...register("position", { required: "Position is required" })}
            />
            <TextInput
              label="Department"
              required
              error={errors.department?.message}
              {...register("department", {
                required: "Department is required"
              })}
            />
          </SimpleGrid>

          <Controller
            name="companyId"
            control={control}
            rules={{
              validate: (v) =>
                !!(v || defaultCompanyId) || "Company is required"
            }}
            render={({ field, fieldState }) => (
              <Select
                label="Company"
                required
                placeholder="Select company"
                data={companyOptions}
                value={field.value || defaultCompanyId || null}
                onChange={(v) => field.onChange(v ?? "")}
                error={fieldState.error?.message}
                searchable
              />
            )}
          />

          <SimpleGrid cols={2}>
            <TextInput label="Phone number" {...register("phoneNumber")} />
            <Controller
              name="contractType"
              control={control}
              render={({ field }) => (
                <Select
                  label="Contract type"
                  data={CONTRACT_TYPE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  clearable
                />
              )}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <Controller
              name="salary"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Salary"
                  min={0}
                  value={field.value ?? ""}
                  onChange={(v) =>
                    field.onChange(typeof v === "number" ? v : null)
                  }
                />
              )}
            />
            <Controller
              name="workingHoursPerWeek"
              control={control}
              render={({ field }) => (
                <NumberInput
                  label="Hours / week"
                  min={0}
                  max={168}
                  value={field.value ?? ""}
                  onChange={(v) =>
                    field.onChange(typeof v === "number" ? v : null)
                  }
                />
              )}
            />
          </SimpleGrid>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createEmployee.isPending}>
              Create employee
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
