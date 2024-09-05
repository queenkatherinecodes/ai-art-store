export const logService = {
    logContactUs: async (user) => {
        try {
            const activity = 'contact-us-sent';
            const response = await fetch(`/api/log/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user, activity }),
            });
            if (!response.ok) {
                throw new Error('Failed to log submission of contact us form.');
            }
            return await response.json();
        } catch (error) {
            console.error('Error logging submission of contact us form.');
            throw error;
        }
    },
    logLoginFromLandingPage: async () => {
        try {
            const activity = 'login-via-browse-products-btn';
            const user = 'N/A'
            const response = await fetch(`/api/log/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user, activity }),
            });
            if (!response.ok) {
                throw new Error('Failed to log login via browse products button.');
            }
            return await response.json();
        } catch (error) {
            console.error('Error logging login via browse products button.');
            throw error;
        }
    },
};
