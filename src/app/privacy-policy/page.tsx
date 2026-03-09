export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-12">
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                <p className="mb-4 text-gray-700">Last updated: [Date]</p>
                <h2 className="text-xl font-semibold mt-4 mb-2">1. Introduction</h2>
                <p className="text-gray-700 mb-4">
                    Welcome to our application. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or use our platform.
                </p>
                <h2 className="text-xl font-semibold mt-4 mb-2">2. Data We Collect</h2>
                <p className="text-gray-700 mb-4">
                    We collect information that you manually upload to our platform including videos, images, and connected account data strictly for the use of running social media automations.
                </p>
                <h2 className="text-xl font-semibold mt-4 mb-2">3. Third Party Services</h2>
                <p className="text-gray-700 mb-4">
                    We integrate with systems such as Meta Developer API and TikTok Content API. Data shared strictly complies with their respective policies and is managed solely by our cloud function system.
                </p>
                <h2 className="text-xl font-semibold mt-4 mb-2">4. Contact Us</h2>
                <p className="text-gray-700 mb-4">
                    If you have any questions or require more information about our Privacy Policy, do not hesitate to contact us.
                </p>
            </div>
        </div>
    );
}
