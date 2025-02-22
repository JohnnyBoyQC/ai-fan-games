console.log('AI Fan Games website loaded');
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('nav ul li a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            console.log('Navigated to:', link.href);
        });
    });
});