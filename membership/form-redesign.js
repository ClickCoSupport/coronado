/* Chabad.org form redesign loader — membership form 6926340 only */
(function () {
    const targetForm = "form[name='form_6926340']";

    function loadFormRedesign() {
        if (!document.querySelector(targetForm)) return;

        if (window.form6926340RedesignLoaded) return;
        window.form6926340RedesignLoaded = true;

        // Styling variables for this form only
        const styles = document.createElement("style");
        styles.textContent = `
            form[name='form_6926340'] {
                --font-form-main: "Muli", sans-serif;
                --primary-form-color: #0f6cb8;
                --contrast-form-color: #0f6cb8;
                --accent-form-color: #2fd3c2;
                --accent-form-light: #eafbf9;
                --accent-form-medium: #d5f6f3;
                --border-form-color: #dddddd;
                --text-form-dark: #343333;
                --text-form-muted: #666666;

                /* Form size and label layout */
                --form-scale: 0.8;
            }
        `;
        document.head.appendChild(styles);

        // Load official Chabad.org form CSS
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = "https://w2.Chabad.org/images/Shluchim/minisites/themes/form-redesign/form-style.css";
        document.head.appendChild(css);

        // Load official Chabad.org form JavaScript
        const script = document.createElement("script");
        script.src = "https://w2.Chabad.org/images/Shluchim/minisites/themes/form-redesign/form-script.js";
        document.body.appendChild(script);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadFormRedesign);
    } else {
        loadFormRedesign();
    }
})();
