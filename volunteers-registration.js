/**
 * volunteers-registration.js
 * Logic for CHOSEN 2026 Volunteer Registration
 */

const VOLUNTEER_CONFIG = {
    formUrl: "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdwKEY-wG4mkJ-AJH0hwYI1MGvuxRD8PAljSUgw-5qwX9xurw/formResponse",
    fields: {
        name: "entry.621551616",
        age: "entry.857494556",
        parish: "entry.1930450021",
        zone: "entry.2100924150",
        phone: "entry.1700546849",
        email: "entry.650423779",
        profession: "entry.484955764",
        jy_experience: "entry.1880896446",
        interested_ministry: "entry.1594099406",
        previous_experience: "entry.45916909",
        major_programs: "entry.961224152",
        training_willingness: "entry.1978575858",
        availability_5days: "entry.1596111592",
        availability_details: "entry.1530935288"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('volunteer-registration-form');
    const submitBtn = document.getElementById('submit-btn');
    const loadingState = document.getElementById('loading-state');
    const formContainer = document.getElementById('form-container');
    const successMessage = document.getElementById('success-message');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Validate Form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // 2. Prepare Submission
        const formData = new FormData(form);
        const submissionData = new URLSearchParams();

        // Map all fields in the form to the submission data
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('entry.')) {
                submissionData.append(key, value);
            }
        }

        try {
            // Show Loading
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.innerText = "Submitting...";
            loadingState.style.display = 'block';

            // 3. Submit to Google Forms
            await fetch(VOLUNTEER_CONFIG.formUrl, {
                method: 'POST',
                body: submissionData,
                mode: 'no-cors'
            });

            // 4. Success
            formContainer.style.display = 'none';
            successMessage.style.display = 'block';
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (err) {
            console.error("Submission error:", err);
            alert("Something went wrong. Please try again or contact the coordinator.");
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerText = "Submit Registration";
            loadingState.style.display = 'none';
        }
    });
});
