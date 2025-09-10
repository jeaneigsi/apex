export default function VncViewer({ src }: { src?: string }) {
  if (!src) return <div className="text-sm text-gray-600">No VNC stream</div>;
  return (
    <iframe src={src} className="w-full h-[480px] border rounded" title="E2B Desktop" />
  );
}

