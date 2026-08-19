const ADMIN_API =
    "/api/admin/feedback";

let feedbackList = [];

let editingId = null;


/* =========================
   AUTH
========================= */

function checkAdminAuthentication() {

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");

    if (!token || role !== "ADMIN") {

        window.location.href =
            "/login.html";

        return false;
    }

    return true;
}


if (!checkAdminAuthentication()) {
    throw new Error("Unauthorized");
}


/* =========================
   USERNAME
========================= */

document
    .getElementById("usernameDisplay")
    .textContent =
    localStorage.getItem("username")
        || "Admin";


/* =========================
   ELEMENTS
========================= */

const tableBody =
    document.getElementById(
        "feedbackTableBody"
    );

const tableContainer =
    document.getElementById(
        "tableContainer"
    );

const tableLoading =
    document.getElementById(
        "tableLoading"
    );

const recordCount =
    document.getElementById(
        "recordCount"
    );

const editSection =
    document.getElementById(
        "editSection"
    );

const editFeedback =
    document.getElementById(
        "editFeedback"
    );

const editForm =
    document.getElementById(
        "editForm"
    );

const updateButton =
    document.getElementById(
        "updateButton"
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

    element.classList.remove(
        "hidden"
    );

    setTimeout(() => {

        element.classList.add(
            "hidden"
        );

    }, 4000);
}


function showSuccess(message) {

    const element =
        document.getElementById(
            "successMessage"
        );

    element.textContent = message;

    element.classList.remove(
        "hidden"
    );

    setTimeout(() => {

        element.classList.add(
            "hidden"
        );

    }, 4000);
}


/* =========================
   API
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
   LOAD
========================= */

loadFeedback();


async function loadFeedback() {

    try {

        tableLoading.classList.remove(
            "hidden"
        );

        tableContainer.classList.add(
            "hidden"
        );


        const response =
            await apiRequest(
                ADMIN_API
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

        renderTable();

    } catch (error) {

        showError(
            error.message
        );

    } finally {

        tableLoading.classList.add(
            "hidden"
        );

        tableContainer.classList.remove(
            "hidden"
        );
    }
}


/* =========================
   TABLE
========================= */

function renderTable() {

    recordCount.textContent =
        `${feedbackList.length} record${
            feedbackList.length === 1
                ? ""
                : "s"
        }`;


    if (!feedbackList.length) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="no-data"
                >
                    No feedback found
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        feedbackList.map(item => {

            const username =
                item.user?.username
                    || "User";


            const date =
                item.createdAt
                    ? new Date(
                        item.createdAt
                    ).toLocaleString()
                    : "-";


            const feedback =
                escapeHtml(
                    item.feedback
                );


            return `
                <tr>

                    <td>
                        #${item.id}
                    </td>

                    <td>
                        <span class="user-name">
                            ${escapeHtml(
                                username
                            )}
                        </span>
                    </td>

                    <td>
                        <div class="feedback-preview">
                            ${feedback}
                        </div>
                    </td>

                    <td>
                        ${date}
                    </td>

                    <td>

                        <div class="table-actions">

                            <button
                                class="btn btn-view"
                                onclick="viewFeedback(${item.id})"
                            >
                                View
                            </button>

                            <button
                                class="btn btn-edit"
                                onclick="startEdit(${item.id})"
                            >
                                Edit
                            </button>

                            <button
                                class="btn btn-delete"
                                onclick="deleteFeedback(${item.id})"
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");
}


/* =========================
   VIEW
========================= */

function viewFeedback(id) {

    const item =
        feedbackList.find(
            feedback => feedback.id === id
        );

    if (!item) {
        return;
    }


    document.getElementById(
        "modalId"
    ).textContent =
        `#${item.id}`;


    document.getElementById(
        "modalUser"
    ).textContent =
        item.user?.username || "User";


    document.getElementById(
        "modalDate"
    ).textContent =
        item.createdAt
            ? new Date(
                item.createdAt
            ).toLocaleString()
            : "-";


    document.getElementById(
        "modalFeedback"
    ).textContent =
        item.feedback;


    document
        .getElementById("viewModal")
        .classList.remove("hidden");
}


/* =========================
   CLOSE MODAL
========================= */

document
    .getElementById(
        "closeModalButton"
    )
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById(
        "viewModal"
    )
    .addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                this
            ) {
                closeModal();
            }

        }
    );


function closeModal() {

    document
        .getElementById("viewModal")
        .classList.add("hidden");
}


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

    editFeedback.value =
        item.feedback;

    editSection.classList.remove(
        "hidden"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   UPDATE
========================= */

editForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const feedback =
            editFeedback.value.trim();

        if (!feedback) {

            showError(
                "Feedback cannot be empty"
            );

            return;
        }


        updateButton.disabled = true;

        updateButton.textContent =
            "Updating...";


        try {

            const response =
                await apiRequest(
                    `${ADMIN_API}/${editingId}`,
                    {
                        method: "PUT",

                        body: JSON.stringify({
                            feedback:
                                feedback
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    typeof data === "string"
                        ? data
                        : "Unable to update feedback"
                );
            }


            showSuccess(
                "Feedback updated successfully"
            );


            cancelEdit();

            await loadFeedback();

        } catch (error) {

            showError(
                error.message
            );

        } finally {

            updateButton.disabled =
                false;

            updateButton.textContent =
                "Update Feedback";
        }

    }
);


/* =========================
   CANCEL EDIT
========================= */

document
    .getElementById(
        "cancelEditButton"
    )
    .addEventListener(
        "click",
        cancelEdit
    );


function cancelEdit() {

    editingId = null;

    editFeedback.value = "";

    editSection.classList.add(
        "hidden"
    );
}


/* =========================
   DELETE
========================= */

async function deleteFeedback(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this feedback?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await apiRequest(
                `${ADMIN_API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.text();


        if (!response.ok) {

            throw new Error(
                data ||
                "Unable to delete feedback"
            );
        }


        showSuccess(
            "Feedback deleted successfully"
        );


        await loadFeedback();

    } catch (error) {

        showError(
            error.message
        );
    }
}


/* =========================
   LOGOUT
========================= */

document
    .getElementById(
        "logoutButton"
    )
    .addEventListener(
        "click",
        function() {

            localStorage.clear();

            window.location.href =
                "/login.html";
        }
    );


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}