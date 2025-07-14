import { ResponsiveDialog } from "@/components/responsive-dialog";
import { AgentForm } from "./agent-form";
import { AgentGetOne } from "../../types";

interface UpdateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inittialValues: AgentGetOne;
}

export const UpdateAgentDialog = ({ open, onOpenChange, inittialValues }: UpdateAgentDialogProps) => {
  return (
    <ResponsiveDialog
      title="New Agent"
      description="Create a  new agent"
      open={open}
      onOpenChange={onOpenChange}
    >
      <AgentForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={inittialValues}
      />
    </ResponsiveDialog>
  );
};
