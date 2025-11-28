import { siteConfig } from "@/config/site.config";

export const LEGAL = {
    termsOfService: {
        lastUpdated: "November 25, 2025",
        sections: [
            {
                title: "Acceptance of Terms",
                description: `By using ${siteConfig.name}, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you are using ${siteConfig.name} on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these terms.`,
            },
            {
                title: "License",
                description: `${siteConfig.name} is an open-source project distributed under the MIT License. You are free to use, modify, and distribute ${siteConfig.name}'s source code in accordance with the terms specified in the MIT License. A copy of the MIT License is included in the ${siteConfig.name} repository.`,
            },
            {
                title: "Code of Conduct",
                description: `When using ${siteConfig.name}, you agree to abide by our Code of Conduct, available in the project repository. The Code of Conduct outlines the expected behavior within the ${siteConfig.name} community and helps create a positive and inclusive environment for all contributors.`,
            },
            {
                title: "No Warranty",
                description: `${siteConfig.name} is provided "as is" without warranty of any kind, express or implied. The developers of ${siteConfig.name} make no guarantees regarding its functionality, security, or fitness for a particular purpose. You use ${siteConfig.name} at your own risk.`,
            },
            {
                title: "Limitation of Liability",
                description: `In no event shall the developers of ${siteConfig.name} be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of ${siteConfig.name}.`,
            },
            {
                title: "Contributions",
                description: `Contributions to ${siteConfig.name} are welcome, and by submitting a pull request or contributing in any other way, you agree to license your contribution under the terms of the MIT License.`,
            },
            {
                title: "Termination",
                description: `The developers of ${siteConfig.name} reserve the right to terminate or suspend access to ${siteConfig.name} at any time, with or without cause and with or without notice.`,
            },
            {
                title: "Changes to Terms",
                description: `These Terms of Service may be updated from time to time. It is your responsibility to review these terms periodically. Your continued use of ${siteConfig.name} after changes to these terms signifies your acceptance of the updated terms.`,
            },
            {
                title: "Contact Information",
                description: `If you have any questions or concerns about these Terms of Service, please contact us at ${siteConfig.author.email}.`,
            },
        ],
    },

    privacyPolicy: {
        lastUpdated: "November 25, 2025",
        sections: [
            {
                title: "Introduction",
                description: `Thank you for choosing ${siteConfig.name}. This Privacy Policy outlines how we collect, use, disclose, and protect your information when you use ${siteConfig.name}. By using the application, you consent to the practices described in this Policy.`,
            },
            {
                title: "Information We Collect",
                description: `- **Personal Information:** When you register, we collect your Email and Name to authenticate and manage your session.\n- **Report Data:** When you create a crime report, we collect the information you provide, including title, description, images, and geographic location.\n- **Location:** We use your location data to display the map and nearby alerts, but we do not track your movement history.`,
            },
            {
                title: "How We Use Your Information",
                description: `- **Service Provision:** To display crime alerts, manage reports, and verify reliability.\n- **Experience Improvement:** To analyze anonymous data for improving application performance.`,
            },
            {
                title: "Data Security",
                description: `- **Storage:** Your data is securely stored on our servers and protected by standard technical measures.\n- **No Sharing:** We do not sell or share your personal information with third parties for commercial purposes.`,
            },
            {
                title: "Third-Party Links",
                description: `- **External Links:** ${siteConfig.name} may contain links to external websites or resources (e.g., news). This Privacy Policy applies only to ${siteConfig.name}.`,
            },
            {
                title: "Changes to Privacy Policy",
                description: `- **Updates:** This Privacy Policy may be updated. Your continued use of ${siteConfig.name} after changes signifies your acceptance of the new policies.`,
            },
            {
                title: "Contact Information",
                description: `If you have questions about this Privacy Policy, please contact us at: ${siteConfig.author.email}.`,
            },
        ],
    },
};
