// State to track social steps
const steps = {
    twitter: false,
    instagram: false,
    discord: false
};

function completeStep(platform) {
    if (steps[platform]) return;

    steps[platform] = true;
    const element = document.getElementById(`step-${platform}`);
    if (element) {
        element.classList.add('done');
    }

    // Check if all steps are done
    if (steps.twitter && steps.instagram && steps.discord) {
        const btn = document.getElementById('btn-register');
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    }
}

async function handleAirdropSubmit(e) {
    e.preventDefault();

    // Basic verification of steps (redundant but safe)
    if (!steps.twitter || !steps.instagram || !steps.discord) {
        alert('Please complete all social tasks first!');
        return;
    }

    const email = document.getElementById('email').value;
    const wallet = document.getElementById('wallet').value;

    // Wallet Pattern Validation
    if (!document.getElementById('wallet').checkValidity()) {
        alert('Please enter a valid ERC address starting with 0x');
        return;
    }

    // UI Loading State
    const btn = document.getElementById('btn-register');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    try {
        // Send data to backend
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, wallet })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Success State
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Success!';
            btn.style.background = 'var(--success)';
            btn.style.color = '#000';

            alert(`Successfully registered!\nSee you in the Crypto Gothci verse!`);
            e.target.reset(); // Clear form
        } else {
            // Error State
            throw new Error(result.message || 'Registration failed');
        }

    } catch (error) {
        console.error('Submission error:', error);
        alert('Error: ' + error.message);
        btn.innerHTML = originalText;
    } finally {
        // Reset button after delay if successful, or immediately if error logic allows
        setTimeout(() => {
            if (btn.innerHTML.includes('Success')) {
                btn.innerHTML = originalText;
                btn.style.background = '';
                btn.style.color = '';
                // Disable again until next interaction or leave enabled? 
                // Usually disabling avoids double submit, but steps are done.
                // Keeping it enabled is fine.
                btn.disabled = false;
            } else {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }, 3000);
    }
}

// Background Parallax Effect
document.addEventListener('mousemove', (e) => {
    const globes = document.querySelectorAll('.globe');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    globes.forEach((globe, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;

        globe.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
});
