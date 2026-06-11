/**
 * Public portfolio configuration.
 *
 * IMPORTANT — security notes (read before editing):
 * - This file is PUBLIC. It ships to every visitor's browser. NEVER put the
 *   Cloudinary API secret or the MongoDB URI here. Only the Cloud name and an
 *   UNSIGNED upload preset are safe to expose.
 * - The "login" below is a convenience gate, NOT real security. Anyone can read
 *   this file. It only stops casual visitors from opening the admin form. Real
 *   protection comes from the fact that publishing requires a git commit.
 *
 * To change the owner password:
 *   1. Open the browser console on the site and run:
 *        await PortfolioAuth.hash('your-new-password')
 *   2. Copy the printed hash into OWNER_PASSWORD_SHA256 below.
 */
window.PORTFOLIO_CONFIG = {
  // ---- Owner login (cosmetic gate) ----
  ownerEmail: 'emil19ro@gmail.com',
  // SHA-256 of the password. Default password: "Emil-Portofoliu-2026" (change it!).
  ownerPasswordSha256:
    'f0d818250ec566847a02416bf0615d610e38689f94a8cd6e0859fc0f7603feab',

  // ---- Cloudinary (images) ----
  // Only the cloud name + an UNSIGNED upload preset. No secret here.
  // Create the preset in Cloudinary: Settings -> Upload -> Add upload preset ->
  // Signing Mode: "Unsigned". Put its name below.
  cloudinary: {
    cloudName: 'dofjstvyj',
    uploadPreset: 'portfolio_unsigned',
    folder: 'portfolio',
  },

  // ---- Data ----
  // Published project data lives in this file (committed to the repo).
  projectsUrl: '/data/projects.json',
};
