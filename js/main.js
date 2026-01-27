// Menu hamburguesa

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector("#primary-nav");

    if (!toggle || !nav) return;

    const setOpen = (open) => {
        nav.dataset.open = open ? "true" : "false";
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };

    // Toggle al hacer clic
    toggle.addEventListener("click", () => {
        const isOpen = nav.dataset.open === "true";
        setOpen(!isOpen);
    });

    // Cerrar menú al hacer clic en un link
    nav.addEventListener("click", (e) => {
        if(e.target.tagName.toLowerCase() === "a") {
            setOpen(false);
        }
    });

    // Cerrar con tecla escape
    document.addEventListener("keydown", (e) => {
        if(e.key === "Escape") setOpen(false);
    });
});