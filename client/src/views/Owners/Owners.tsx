import { useState, useMemo } from "react";
import {
  Title,
  Button,
  Group,
  Stack,
  Alert,
  Loader,
  Center,
  Paper
} from "@mantine/core";
import { IconPlus, IconAlertCircle } from "@tabler/icons-react";
import { useOwners } from "@/api/useOwner";
import type { Owner } from "@/types/Owner.model";
import { DataGrid } from "@/components/DataGrid/DataGrid";
import { getOwnerColumnDefs, defaultOwnerColDef } from "./Owners.columns";
import { CreateOwnerModal } from "./CreateOwnerModal";
import { EditOwnerModal } from "./EditOwnerModal";
import { DeleteOwnerModal } from "./DeleteOwnerModal";

// ─── Main view ───────────────────────────────────────────────────────────────

export function Owners() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOwner, setEditOwner] = useState<Owner | null>(null);
  const [deleteOwner, setDeleteOwner] = useState<Owner | null>(null);

  const { data: owners, isLoading, error } = useOwners();

  const columnDefs = useMemo(
    () =>
      getOwnerColumnDefs({ onEdit: setEditOwner, onDelete: setDeleteOwner }),
    []
  );

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={2}>Owners</Title>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={() => setCreateOpen(true)}
          >
            New Owner
          </Button>
        </Group>

        <Paper withBorder radius="md" style={{ height: 520 }}>
          {isLoading && (
            <Center h="100%">
              <Loader size="md" />
            </Center>
          )}

          {error && (
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              color="red"
              variant="light"
              m="md"
            >
              Failed to load owners
            </Alert>
          )}

          {!isLoading && !error && (
            <DataGrid<Owner>
              rowData={owners ?? []}
              columnDefs={columnDefs}
              defaultColDef={defaultOwnerColDef}
            />
          )}
        </Paper>
      </Stack>

      <CreateOwnerModal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EditOwnerModal owner={editOwner} onClose={() => setEditOwner(null)} />
      <DeleteOwnerModal
        owner={deleteOwner}
        onClose={() => setDeleteOwner(null)}
      />
    </>
  );
}
