document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Update theme preview buttons
    document.querySelectorAll('.theme-preview').forEach(el => {
        el.classList.toggle('active', el.dataset.theme === savedTheme);
    });
    
    // Theme switcher functionality
    document.querySelector('.theme-carousel').addEventListener('click', (e) => {
        const themePreview = e.target.closest('.theme-preview');
        if (!themePreview) return;
        const theme = themePreview.dataset.theme;
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        document.querySelectorAll('.theme-preview').forEach(el => {
            el.classList.remove('active');
        });
        themePreview.classList.add('active');
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    });

    // Smooth scrolling for anchor links (if any)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Print button functionality
    const printButton = document.createElement('button');
    printButton.className = 'btn-primary';
    printButton.innerHTML = '<i class="fas fa-print"></i> Print Policy';
    printButton.style.margin = '20px auto';
    printButton.style.display = 'block';
    printButton.style.maxWidth = '220px';
    printButton.style.fontSize = '1rem';
    printButton.addEventListener('click', () => {
        window.print();
    });
    document.querySelector('.privacy-content').appendChild(printButton);

    // Add print-specific styles
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            .app-header, .app-footer, button {
                display: none !important;
            }
            .privacy-container {
                padding: 0 !important;
            }
            .privacy-content {
                box-shadow: none !important;
                padding: 0 !important;
                background: transparent !important;
            }
            body {
                background: white !important;
                color: black !important;
            }
            a {
                color: black !important;
                text-decoration: underline !important;
            }
        }
    `;
    document.head.appendChild(style);
});
