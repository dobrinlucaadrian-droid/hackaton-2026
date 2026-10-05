// Tells Convex which issuer signs the session tokens (this deployment itself, through Convex Auth).
const authConfig = {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
