import { Download, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useProjectExport } from '../hooks/useProjectExport';

export default function ExportButton() {
  const { mutate: exportProject, isPending } = useProjectExport();

  const handleExport = () => {
    exportProject();
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isPending}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export
        </>
      )}
    </Button>
  );
}
