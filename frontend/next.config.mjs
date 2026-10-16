const statusRoutes = [
  "404",
  "429",
  "500",
  "503",
  "account-blocked",
  "auth-required",
  "offline",
  "session-expired",
  "something-went-wrong",
  "unauthorized",
];

const nextConfig = {
  pageExtensions: ["jsx"],

  async redirects() {
    return statusRoutes.map((route) => ({
      source: `/${route}`,
      destination: `/error_status/${route}`,
      permanent: false,
    }));
  },
};

export default nextConfig;
