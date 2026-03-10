import { useState } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Group,
  Button,
  SimpleGrid,
  Title,
  Alert
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useCreateCompany } from "@/api/useCompany";
import { useOwners } from "@/api/useOwner";
import type { Owner } from "@/types/Owner.model";

interface Props {
  opened: boolean;
  onClose: () => void;
  myOwner: Owner | null;
  isAdmin: boolean;
}

const EMPTY_FORM = {
  name: "",
  registrationNumber: "",
  vatNumber: "",
  description: "",
  website: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "",
  currency: "",
  foundedAt: "",
  ownerId: ""
};

export function CreateCompanyModal({
  opened,
  onClose,
  myOwner,
  isAdmin
}: Props) {
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const createCompany = useCreateCompany();
  const { data: owners = [] } = useOwners({ enabled: isAdmin });

  const setStr =
    (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.currentTarget.value }));

  const set = (field: keyof typeof EMPTY_FORM) => (value: string | null) =>
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveOwnerId = isAdmin ? form.ownerId : (myOwner?.id ?? "");

    if (!effectiveOwnerId) {
      notifications.show({
        title: "Error",
        message: "Please select an owner",
        color: "red"
      });
      return;
    }

    createCompany.mutate(
      {
        name: form.name,
        registrationNumber: form.registrationNumber,
        ownerId: effectiveOwnerId,
        ...(form.vatNumber ? { vatNumber: form.vatNumber } : {}),
        ...(form.description ? { description: form.description } : {}),
        ...(form.website ? { website: form.website } : {}),
        ...(form.phone ? { phone: form.phone } : {}),
        ...(form.email ? { email: form.email } : {}),
        ...(form.address ? { address: form.address } : {}),
        ...(form.city ? { city: form.city } : {}),
        ...(form.country ? { country: form.country } : {}),
        ...(form.currency ? { currency: form.currency } : {}),
        ...(form.foundedAt ? { foundedAt: form.foundedAt } : {})
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Company created",
            message: `"${form.name}" has been created.`,
            color: "green"
          });
          setForm({ ...EMPTY_FORM });
          onClose();
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to create company";
          notifications.show({ title: "Error", message: msg, color: "red" });
        }
      }
    );
  };

  const handleClose = () => {
    setForm({ ...EMPTY_FORM });
    createCompany.reset();
    onClose();
  };

  const ownerOptions = owners.map((o) => ({
    value: o.id,
    label: `${o.user.firstName} ${o.user.lastName}${o.displayName ? ` (${o.displayName})` : ""}`
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      title={<Title order={4}>New Company</Title>}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {createCompany.error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="red"
              variant="light"
            >
              {(createCompany.error as Error).message}
            </Alert>
          )}

          <SimpleGrid cols={2}>
            <TextInput
              label="Company name"
              required
              value={form.name}
              onChange={setStr("name")}
            />
            <TextInput
              label="Registration number"
              required
              value={form.registrationNumber}
              onChange={setStr("registrationNumber")}
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

          {isAdmin ? (
            <Select
              label="Owner"
              required
              placeholder="Select owner"
              data={ownerOptions}
              value={form.ownerId || null}
              onChange={set("ownerId")}
              searchable
            />
          ) : (
            <TextInput
              label="Owner"
              value={
                myOwner
                  ? `${myOwner.user.firstName} ${myOwner.user.lastName}`
                  : ""
              }
              readOnly
              disabled
            />
          )}

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

          <SimpleGrid cols={2}>
            <TextInput
              label="Founded date"
              type="date"
              value={form.foundedAt}
              onChange={setStr("foundedAt")}
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
            <Button type="submit" loading={createCompany.isPending}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
