const FEEDBACK_API = "/api/feedback";

let feedbackList = [];

let editingId = null;


/* =========================
   AUTH CHECK
========================= */

function checkUserAuthentication() {

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");

    if (!token || role !== "USER") {

        window.location.href =
            "/login.html";

        return false;
    }

    return true;
}


if (!checkUserAuthentication()) {
    throw new Error("Unauthorized");
}


/* =========================
   INITIAL DATA
========================= */

const usernameDisplay =
    document.getElementById(
        "usernameDisplay"
    );

usernameDisplay.textContent =
    localStorage.getItem("username") || "User";


loadFeedback();


/* =========================
   DOM ELEMENTS
========================= */

const feedbackForm =
    document.getElementById(
        "feedbackForm"
    );

const feedbackInput =
    document.getElementById(
        "feedback"
    );

const formTitle =
    document.getElementById(
        "formTitle"
    );

const submitButton =
    document.getElementById(
        "submitFeedbackButton"
    );

const cancelEditButton =
    document.getElementById(
        "cancelEditButton"
    );

const feedbackContainer =
    document.getElementById(
        "feedbackContainer"
    );


/* =========================
   ALERTS
========================= */

function showError(message) {

    const element =
        document.getElementById(
            "errorMessage"
        );

    element.textContent = message;
    element.classList.remove("hidden");

    setTimeout(() => {

        element.classList.add("hidden");

    }, 4000);
}


function showSuccess(message) {

    const element =
        document.getElementById(
            "successMessage"
        );

    element.textContent = message;
    element.classList.remove("hidden");

    setTimeout(() => {

        element.classList.add("hidden");

    }, 4000);
}


/* =========================
   API REQUEST
========================= */

async function apiRequest(
    url,
    options = {}
) {

    const token =
        localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }

    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );

    if (response.status === 401) {

        localStorage.clear();

        window.location.href =
            "/login.html";

        return;
    }

    return response;
}


/* =========================
   LOAD FEEDBACK
========================= */

async function loadFeedback() {

    try {

        const response =
            await apiRequest(
                `${FEEDBACK_API}/my`
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Unable to load feedback"
            );
        }

        feedbackList = data;

        renderFeedback();

    } catch (error) {

        feedbackContainer.innerHTML = "";

        showError(
            error.message
        );
    }
}


/* =========================
   RENDER
========================= */

function renderFeedback() {

    if (!feedbackList.length) {

        feedbackContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💬</div>

                <h3>No feedback yet</h3>

                <p>
                    You haven't submitted any feedback.
                    Add your first feedback above.
                </p>
            </div>
        `;

        return;
    }


    feedbackContainer.innerHTML =
        feedbackList.map(item => {

            const date =
                item.createdAt
                    ? new Date(
                        item.createdAt
                    ).toLocaleString()
                    : "-";


            return `
                <div
                    class="feedback-item"
                >

                    <div class="feedback-text">

                        <p>
                            ${escapeHtml(
                                item.feedback
                            )}
                        </p>

                        <small>
                            Submitted:
                            ${date}
                        </small>

                    </div>

                    <button
                        class="btn btn-edit"
                        onclick="startEdit(${item.id})"
                    >
                        Edit
                    </button>

                </div>
            `;

        }).join("");
}


/* =========================
   ADD / UPDATE
========================= */

feedbackForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const text =
            feedbackInput.value.trim();

        if (!text) {

            showError(
                "Please enter your feedback"
            );

            return;
        }


        submitButton.disabled = true;

        submitButton.textContent =
            editingId
                ? "Updating..."
                : "Submitting...";


        try {

            let response;


            if (editingId) {

                response =
                    await apiRequest(
                        `${FEEDBACK_API}/${editingId}`,
                        {
                            method: "PUT",

                            body: JSON.stringify({
                                feedback: text
                            })
                        }
                    );

            } else {

                response =
                    await apiRequest(
                        FEEDBACK_API,
                        {
                            method: "POST",

                            body: JSON.stringify({
                                feedback: text
                            })
                        }
                    );
            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    typeof data === "string"
                        ? data
                        : "Operation failed"
                );
            }


            if (editingId) {

                showSuccess(
                    "Feedback updated successfully"
                );

            } else {

                showSuccess(
                    "Feedback submitted successfully"
                );
            }


            resetForm();

            await loadFeedback();

        } catch (error) {

            showError(
                error.message
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                editingId
                    ? "Update Feedback"
                    : "Submit Feedback";
        }

    }
);


/* =========================
   EDIT
========================= */

function startEdit(id) {

    const item =
        feedbackList.find(
            feedback => feedback.id === id
        );

    if (!item) {
        return;
    }

    editingId = id;

    feedbackInput.value =
        item.feedback;

    formTitle.textContent =
        "Edit Feedback";

    submitButton.textContent =
        "Update Feedback";

    cancelEditButton.classList.remove(
        "hidden"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   CANCEL EDIT
========================= */

cancelEditButton.addEventListener(
    "click",
    resetForm
);


function resetForm() {

    editingId = null;

    feedbackInput.value = "";

    formTitle.textContent =
        "Add Feedback";

    submitButton.textContent =
        "Submit Feedback";

    cancelEditButton.classList.add(
        "hidden"
    );
}


/* =========================
   LOGOUT
========================= */

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        function() {

            localStorage.clear();

            window.location.href =
                "/login.html";
        }
    );


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}