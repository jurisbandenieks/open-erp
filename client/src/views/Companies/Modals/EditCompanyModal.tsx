import { useEffect } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Group,
  Button,
  SimpleGrid,
  Alert
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useForm, Controller } from "react-hook-form";
import { useUpdateCompany } from "@/hooks/useCompany";
import type { Company, CompanyStatus } from "@/types/Company.model";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" }
];

interface Props {
  company: Company | null;
  onClose: () => void;
}

interface FormValues {
  name: string;
  vatNumber: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  status: string;
}

export function EditCompanyModal({ company, onClose }: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      vatNumber: "",
      description: "",
      website: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      country: "",
      currency: "",
      status: "active"
    }
  });

  const updateCompany = useUpdateCompany();

  useEffect(() => {
    if (company) {
      reset({
        name: company.name ?? "",
        vatNumber: company.vatNumber ?? "",
        description: company.description ?? "",
        website: company.website ?? "",
        phone: company.phone ?? "",
        email: company.email ?? "",
        address: company.address ?? "",
        city: company.city ?? "",
        country: company.country ?? "",
        currency: company.currency ?? "",
        status: company.status ?? "active"
      });
    }
  }, [company, reset]);

  const onSubmit = (data: FormValues) => {
    if (!company) return;

    updateCompany.mutate(
      {
        id: company.id,
        payload: {
          name: data.name || undefined,
          vatNumber: data.vatNumber || undefined,
          description: data.description || undefined,
          website: data.website || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          country: data.country || undefined,
          currency: data.currency || undefined,
          status: data.status as CompanyStatus
        }
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Company updated",
            message: `"${company.name}" has been updated.`,
            color: "green"
          });
          onClose();
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to update company";
          notifications.show({ title: "Error", message: msg, color: "red" });
        }
      }
    );
  };

  const handleClose = () => {
    updateCompany.reset();
    onClose();
  };

  return (
    <Modal
      opened={!!company}
      onClose={handleClose}
      size="lg"
      title="Edit Company"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {updateCompany.error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="red"
              variant="light"
            >
              {(updateCompany.error as Error).message}
            </Alert>
          )}

          <SimpleGrid cols={2}>
            <TextInput
              label="Company name"
              required
              error={errors.name?.message}
              {...register("name", { required: "Company name is required" })}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  required
                  data={STATUS_OPTIONS}
                  value={field.value}
                  onChange={(v) => field.onChange(v ?? "active")}
                />
              )}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput label="VAT number" {...register("vatNumber")} />
            <TextInput
              label="Currency"
              placeholder="e.g. EUR"
              {...register("currency")}
            />
          </SimpleGrid>

          <TextInput label="Email" type="email" {...register("email")} />

          <SimpleGrid cols={2}>
            <TextInput label="Phone" {...register("phone")} />
            <TextInput label="Website" {...register("website")} />
          </SimpleGrid>

          <TextInput label="Address" {...register("address")} />

          <SimpleGrid cols={2}>
            <TextInput label="City" {...register("city")} />
            <TextInput label="Country" {...register("country")} />
          </SimpleGrid>

          <TextInput label="Description" {...register("description")} />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={updateCompany.isPending}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
