import { Icons } from "@/components/icons";
import { format } from "date-fns";

type ServerStatsProps = {
  stars: number;
  lastCommit: Date | null;
  license?: string | null;
  createdAt: Date;
};

export function ServerStats({
  stars,
  lastCommit,
  license,
  createdAt,
}: ServerStatsProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h3 className="font-semibold">Server Information</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Icons.star className="h-4 w-4" />
            GitHub Stars
          </span>
          <span className="font-medium">{stars.toLocaleString()}</span>
        </div>

        {lastCommit && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Icons.gitCommit className="h-4 w-4" />
              Last Commit
            </span>
            <span className="font-medium">
              {format(lastCommit, "MMM d, yyyy")}
            </span>
          </div>
        )}

        {license && license !== "unknown" && license !== "other" && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Icons.scale className="h-4 w-4" />
              License
            </span>
            <span className="font-medium uppercase">{license}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Icons.calendar className="h-4 w-4" />
            Added
          </span>
          <span className="font-medium">
            {format(createdAt, "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}
