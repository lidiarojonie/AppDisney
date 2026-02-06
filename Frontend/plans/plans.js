// plans.js - Handles functionality for the plans page
document.addEventListener('DOMContentLoaded', () => {
    // User Dropdown Logic
    const userAvatar = document.querySelector('.user-avatar');
    const dropdown = document.querySelector('.user-dropdown');

    if (userAvatar && dropdown) {
        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !userAvatar.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    // Pricing Toggle Logic
    const billingInputs = document.querySelectorAll('input[name="billing_cycle"]');
    const priceElements = document.querySelectorAll('.plan-price');
    const periodElements = document.querySelectorAll('.plan-period');

    const updatePrices = (cycle) => {
        priceElements.forEach((el, index) => {
            const monthlyPrice = parseFloat(el.getAttribute('data-monthly-price'));
            if (cycle === 'annual') {
                // Calculation: 12 months * monthly price - 15% discount
                const annualPrice = (monthlyPrice * 12) * 0.85;
                el.textContent = `${annualPrice.toFixed(2)}€`;
                periodElements[index].textContent = '/yr';
            } else {
                el.textContent = `${monthlyPrice.toFixed(2)}€`;
                periodElements[index].textContent = '/mo';
            }
        });
    };

    billingInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            updatePrices(e.target.value);
        });
    });
});
