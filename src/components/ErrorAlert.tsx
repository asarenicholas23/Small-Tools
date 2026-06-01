import { CircleAlert } from "lucide-react";
import { Alert } from "./ui/alert";

type ErrorAlertProps = {
  message: string;
};

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="flex items-start gap-2">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </Alert>
  );
}
