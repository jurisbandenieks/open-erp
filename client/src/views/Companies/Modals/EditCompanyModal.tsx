import { useState, useEffect } from "react";
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
import { useUpdateCompany } from "@/api/useCompany";
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

type FormState = {
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
};

export function EditCompanyModal({ company, onClose }: Props) {
  const [form, setForm] = useState<FormState>({
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
  });

  const updateCompany = useUpdateCompany();

  useEffect(() => {
    if (company) {
      setForm({
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
  }, [company]);

  const setStr =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.currentTarget.value }));

  const set = (field: keyof FormState) => (value: string | null) =>
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    updateCompany.mutate(
      {
        id: company.id,
        payload: {
          ...(form.name ? { name: form.name } : {}),
          ...(form.vatNumber ? { vatNumber: form.vatNumber } : {}),
          ...(form.description ? { description: form.description } : {}),
          ...(form.website ? { website: form.website } : {}),
          ...(form.phone ? { phone: form.phone } : {}),
          ...(form.email ? { email: form.email } : {}),
          ...(form.address ? { address: form.address } : {}),
          ...(form.city ? { city: form.city } : {}),
          ...(form.country ? { country: form.country } : {}),
          ...(form.currency ? { currency: form.currency } : {}),
          status: form.status as CompanyStatus
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
      <form onSubmit={handleSubmit}>
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
              value={form.name}
              onChange={setStr("name")}
            />
            <Select
              label="Status"
              required
              data={STATUS_OPTIONS}
              value={form.status}
              onChange={set("status")}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput
              label="VAT number"
              value={form.vatNumber}
              onChange={setStr("vatNumber")}
            />
            <TextInput
              label="Currency"
              placeholder="e.g. EUR"
              value={form.currency}
              onChange={setStr("currency")}
            />
          </SimpleGrid>

          <TextInput
            label="Email"
            type="email"
            value={form.email}
            onChange={setStr("email")}
          />

          <SimpleGrid cols={2}>
            <TextInput
              label="Phone"
              value={form.phone}
              onChange={setStr("phone")}
            />
            <TextInput
              label="Website"
              value={form.website}
              onChange={setStr("website")}
            />
          </SimpleGrid>

          <TextInput
            label="Address"
            value={form.address}
            onChange={setStr("address")}
          />

          <SimpleGrid cols={2}>
            <TextInput
              label="City"
              value={form.city}
              onChange={setStr("city")}
            />
            <TextInput
              label="Country"
              value={form.country}
              onChange={setStr("country")}
            />
          </SimpleGrid>

          <TextInput
            label="Description"
            value={form.description}
            onChange={setStr("description")}
          />

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
