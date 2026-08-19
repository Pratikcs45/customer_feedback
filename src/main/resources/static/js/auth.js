const API_BASE_URL = "/api";

/* =========================
   COMMON FUNCTIONS
========================= */

function showError(message) {

    const element = document.getElementById("errorMessage");

    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.remove("hidden");
}

function showSuccess(message) {

    const element = document.getElementById("successMessage");

    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.remove("hidden");
}

function hideAlerts() {

    const error = document.getElementById("errorMessage");
    const success = document.getElementById("successMessage");

    if (error) {
        error.classList.add("hidden");
    }

    if (success) {
        success.classList.add("hidden");
    }
}

function getErrorMessage(responseData) {

    if (typeof responseData === "string") {
        return responseData;
    }

    if (responseData?.message) {
        return responseData.message;
    }

    return "Something went wrong";
}


/* =========================
   LOGIN
========================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        hideAlerts();

        const loginButton =
            document.getElementById("loginButton");

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        const username =
            document.getElementById("username").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            const response = await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(data)
                );
            }

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "username",
                data.username
            );

            localStorage.setItem(
                "role",
                data.role
            );

            if (data.role === "ADMIN") {

                window.location.href =
                    "/admin.html";

            } else {

                window.location.href =
                    "/feedback.html";
            }

        } catch (error) {

            showError(
                error.message ||
                "Invalid username or password"
            );

        } finally {

            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }

    });
}


/* =========================
   REGISTER
========================= */

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            hideAlerts();

            const registerButton =
                document.getElementById("registerButton");

            const username =
                document.getElementById("username")
                    .value.trim();

            const email =
                document.getElementById("email")
                    .value.trim();

            const password =
                document.getElementById("password")
                    .value;

            const confirmPassword =
                document.getElementById("confirmPassword")
                    .value;

            if (password !== confirmPassword) {

                showError(
                    "Passwords do not match"
                );

                return;
            }

            registerButton.disabled = true;
            registerButton.textContent =
                "Creating account...";

            try {

                const response = await fetch(
                    `${API_BASE_URL}/auth/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            username: username,
                            email: email,
                            password: password,
                            confirmPassword: confirmPassword
                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        getErrorMessage(data)
                    );
                }

                showSuccess(
                    "Registration successful. Redirecting to login..."
                );

                registerForm.reset();

                setTimeout(() => {

                    window.location.href =
                        "/login.html";

                }, 1500);

            } catch (error) {

                showError(
                    error.message ||
                    "Registration failed"
                );

            } finally {

                registerButton.disabled = false;
                registerButton.textContent =
                    "Sign Up";
            }

        }
    );
}