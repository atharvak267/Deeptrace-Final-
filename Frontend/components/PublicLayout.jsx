import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background-deep text-onSurface flex flex-col">
      <Outlet />
    </div>
  );
}
