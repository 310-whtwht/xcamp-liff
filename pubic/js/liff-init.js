// LIFF initialization and core functionality
const liffConfig = {
  liffId: "2006896450-vnb1zWel",
  gasWebhookUrl: "https://script.google.com/macrosredirectToLineFriendAdd()/s/AKfycbwQDYZAQDqPynAU1N70tD3CjLwAQviY7U2aGacvA3xlpYASTQE6qQ7cmZH_p2qynf9QmA/exec",
  lineId: "144sbyhq",
};

class LiffManager {
  constructor(config) {
    this.liffId = config.liffId;
    this.gasWebhookUrl = config.gasWebhookUrl;
    this.lineId = config.lineId;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      await liff.init({ liffId: this.liffId });
      this.isInitialized = true;
      this.handleAuthentication();
    } catch (error) {
      console.error("LIFF initialization error:", error);
      this.showError("Failed to initialize LIFF. Please try again.");
    }
  }

  async handleAuthentication() {
    if (!this.isInitialized) return;

    if (liff.isLoggedIn()) {
      this.showLoading();
      await this.handleUserProfile();
    } else {
      liff.login();
    }
  }

  async handleUserProfile() {
    try {
      const profile = await liff.getProfile();
      await this.sendUserDataToGAS(profile);
      this.redirectToLineFriendAdd();
    } catch (error) {
      console.error("Profile handling error:", error);
      this.showError("Failed to process user profile. Please try again.");
    }
  }

  async sendUserDataToGAS(profile) {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.append("userId", profile.userId);

    try {
      const response = await fetch(this.gasWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(queryParams.entries())),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("GAS webhook error:", error);
      throw error;
    }
  }

  redirectToLineFriendAdd() {
    window.location.href = `https://line.me/R/ti/p/${this.lineId}`;
  }

  showLoading() {
    const loadingElement = document.getElementById("loading");
    if (loadingElement) {
      loadingElement.style.display = "block";
    }
  }

  showError(message) {
    const errorElement = document.getElementById("error");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }
}

// Initialize LIFF when the document is ready
document.addEventListener("DOMContentLoaded", () => {
  const liffManager = new LiffManager(liffConfig);
  liffManager.initialize();
});
