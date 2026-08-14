export function isZdhPilotHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "lab.zenitedatahub.com" ||
    hostname.endsWith(".workers.dev")
  );
}
