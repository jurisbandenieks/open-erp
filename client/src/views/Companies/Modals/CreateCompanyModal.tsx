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
import { useCreateCompany } from "@/hooks/useCompany";
import { useOwners } from "@/hooks/useOwner";
import type { Owner } from "@/types/Owner.model";

interface Props {
  opened: boolean;
  onClose: () => void;
  myOwner: Owner | null;
  isAdmin: boolean;
}

interface FormValues {
  name: string;
  registrationNumber: string;
  vatNumber: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  foundedAt: string;
  ownerId: string;
}

export function CreateCompanyModal({
  opened,
  onClose,
  myOwner,
  isAdmin
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
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
    }
  });

  const createCompany = useCreateCompany();
  const { data: owners = [] } = useOwners({ enabled: isAdmin });

  useEffect(() => {
    if (!opened) reset();
  }, [opened, reset]);

  const onSubmit = (data: FormValues) => {
    const effectiveOwnerId = isAdmin ? data.ownerId : (myOwner?.id ?? "");

    createCompany.mutate(
      {
        name: data.name,
        registrationNumber: data.registrationNumber,
        ownerId: effectiveOwnerId,
        vatNumber: data.vatNumber || undefined,
        description: data.description || undefined,
        website: data.website || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        currency: data.currency || undefined,
        foundedAt: data.foundedAt || undefined
      },
      {
        onSuccess: () => {
          notifications.show({
            title: "Company created",
            message: `"${data.name}" has been created.`,
            color: "green"
          });
          reset();
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
    reset();
    createCompany.reset();
    onClose();
  };

  const ownerOptions = owners.map((o) => ({
    value: o.id,
    label: `${o.user.firstName} ${o.user.lastName}${o.displayName ? ` (${o.displayName})` : ""}`
  }));

  return (
    <Modal opened={opened} onClose={handleClose} size="lg" title="New Company">
      <form onSubmit={handleSubmit(onSubmit)}>
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
              error={errors.name?.message}
              {...register("name", { required: "Company name is required" })}
            />
            <TextInput
              label="Registration number"
              required
              error={errors.registrationNumber?.message}
              {...register("registrationNumber", {
                required: "Registration number is required"
              })}
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

          {isAdmin ? (
            <Controller
              name="ownerId"
              control={control}
              rules={{ required: "Owner is required" }}
              render={({ field, fieldState }) => (
                <Select
                  label="Owner"
                  required
                  placeholder="Select owner"
                  data={ownerOptions}
                  value={field.value || null}
                  onChange={(v) => field.onChange(v ?? "")}
                  error={fieldState.error?.message}
                  searchable
                />
              )}
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

          <SimpleGrid cols={2}>
            <TextInput
              label="Founded date"
              type="date"
              {...register("foundedAt")}
            />
          </SimpleGrid>

          <TextInput label="Description" {...register("description")} />

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
