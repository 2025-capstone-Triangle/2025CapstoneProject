import { DefaultTopBar } from "./DefaultTopBar";

interface HomeTopBarProps {
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

export function HomeTopBar({ onMenuClick, onNotificationClick }: HomeTopBarProps) {
  return (
    <DefaultTopBar
      title="Person:a"
      onMenuClick={onMenuClick}
      onNotificationClick={onNotificationClick}
    />
  );
}
