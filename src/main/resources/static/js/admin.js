const ADMIN_API = "/api/admin/feedback";

let feedbackList = [];

let editingId = null;


/* =========================
   AUTHENTICATION
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

document.getElementById(
    "usernameDisplay"
).textContent =
    localStorage.getItem("username") || "Admin";


/* =========================
   DOM ELEMENTS
========================= */

// Alerts

const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const successMessage =
    document.getElementById(
        "successMessage"
    );


// Add

const addSection =
    document.getElementById(
        "addSection"
    );

const addFeedbackButton =
    document.getElementById(
        "addFeedbackButton"
    );

const cancelAddButton =
    document.getElementById(
        "cancelAddButton"
    );

const cancelAddButton2 =
    document.getElementById(
        "cancelAddButton2"
    );

const addForm =
    document.getElementById(
        "addForm"
    );

const userIdInput =
    document.getElementById(
        "userId"
    );

const addFeedbackInput =
    document.getElementById(
        "addFeedback"
    );

const addButton =
    document.getElementById(
        "addButton"
    );


// Edit

const editSection =
    document.getElementById(
        "editSection"
    );

const cancelEditButton =
    document.getElementById(
        "cancelEditButton"
    );

const cancelEditButton2 =
    document.getElementById(
        "cancelEditButton2"
    );

const editForm =
    document.getElementById(
        "editForm"
    );

const editFeedback =
    document.getElementById(
        "editFeedback"
    );

const updateButton =
    document.getElementById(
        "updateButton"
    );


// Table

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


// Modal

const viewModal =
    document.getElementById(
        "viewModal"
    );

const closeModalButton =
    document.getElementById(
        "closeModalButton"
    );


/* =========================
   ALERT FUNCTIONS
========================= */

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.remove(
        "hidden"
    );

    successMessage.classList.add(
        "hidden"
    );

    setTimeout(() => {

        errorMessage.classList.add(
            "hidden"
        );

    }, 4000);
}


function showSuccess(message) {

    successMessage.textContent =
        message;

    successMessage.classList.remove(
        "hidden"
    );

    errorMessage.classList.add(
        "hidden"
    );

    setTimeout(() => {

        successMessage.classList.add(
            "hidden"
        );

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
        "Content-Type":
            "application/json",

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


    /*
     * JWT expired / invalid
     */

    if (response.status === 401) {

    localStorage.clear();

    window.location.href =
        "/login.html";

    return null;
}

if (response.status === 403) {

    throw new Error(
        "You do not have permission to perform this action or user does not exist"
    );
}


    return response;
}


/* =========================
   LOAD FEEDBACK
========================= */

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


        if (!response) {
            return;
        }


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
            error.message ||
            "Unable to load feedback"
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
   RENDER TABLE
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
        feedbackList.map(
            item => {

                const username =
                    item.user?.username ||
                    "User";


                const date =
                    item.createdAt
                        ? new Date(
                            item.createdAt
                        ).toLocaleString()
                        : "-";


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
                                ${escapeHtml(
                                    item.feedback
                                )}
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

            }
        ).join("");
}


/* =========================
   OPEN ADD FORM
========================= */

addFeedbackButton.addEventListener(
    "click",
    function () {

        // Hide edit if open
        cancelEdit();


        addForm.reset();

        addSection.classList.remove(
            "hidden"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        userIdInput.focus();
    }
);


/* =========================
   CANCEL ADD
========================= */

function cancelAdd() {

    addForm.reset();

    addSection.classList.add(
        "hidden"
    );
}


cancelAddButton.addEventListener(
    "click",
    cancelAdd
);


cancelAddButton2.addEventListener(
    "click",
    cancelAdd
);


/* =========================
   ADD FEEDBACK
========================= */

addForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const userId =
            userIdInput.value.trim();

        const feedback =
            addFeedbackInput.value.trim();


        if (!userId) {

            showError(
                "User ID is required"
            );

            return;
        }


        if (
            Number(userId) <= 0
        ) {

            showError(
                "Please enter a valid User ID"
            );

            return;
        }


        if (!feedback) {

            showError(
                "Feedback is required"
            );

            return;
        }


        addButton.disabled = true;

        addButton.textContent =
            "Adding...";


        try {

            /*
             * Backend API:
             *
             * POST
             * /api/admin/feedback?userId=1
             */

            const response =
                await apiRequest(
                    `${ADMIN_API}?userId=${encodeURIComponent(userId)}`,
                    {
                        method: "POST",

                        body: JSON.stringify({
                            feedback:
                                feedback
                        })
                    }
                );


            if (!response) {
                return;
            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    typeof data === "string"
                        ? data
                        : "Unable to add feedback"
                );
            }


            showSuccess(
                "Feedback added successfully"
            );


            cancelAdd();


            await loadFeedback();

        } catch (error) {

            showError(
                error.message ||
                "Unable to add feedback"
            );

        } finally {

            addButton.disabled = false;

            addButton.textContent =
                "Add Feedback";
        }
    }
);


/* =========================
   START EDIT
========================= */

function startEdit(id) {

    const item =
        feedbackList.find(
            feedback =>
                feedback.id === id
        );


    if (!item) {

        showError(
            "Feedback not found"
        );

        return;
    }


    // Hide add form
    cancelAdd();


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


    editFeedback.focus();
}


/* =========================
   UPDATE FEEDBACK
========================= */

editForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!editingId) {

            showError(
                "No feedback selected"
            );

            return;
        }


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


            if (!response) {
                return;
            }


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
                error.message ||
                "Unable to update feedback"
            );

        } finally {

            updateButton.disabled = false;

            updateButton.textContent =
                "Update Feedback";
        }
    }
);


/* =========================
   CANCEL EDIT
========================= */

function cancelEdit() {

    editingId = null;

    editFeedback.value = "";

    editSection.classList.add(
        "hidden"
    );
}


cancelEditButton.addEventListener(
    "click",
    cancelEdit
);


cancelEditButton2.addEventListener(
    "click",
    cancelEdit
);


/* =========================
   VIEW FEEDBACK
========================= */

function viewFeedback(id) {

    const item =
        feedbackList.find(
            feedback =>
                feedback.id === id
        );


    if (!item) {

        showError(
            "Feedback not found"
        );

        return;
    }


    document.getElementById(
        "modalId"
    ).textContent =
        `#${item.id}`;


    document.getElementById(
        "modalUser"
    ).textContent =
        item.user?.username ||
        "User";


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


    viewModal.classList.remove(
        "hidden"
    );
}


/* =========================
   CLOSE MODAL
========================= */

function closeModal() {

    viewModal.classList.add(
        "hidden"
    );
}


closeModalButton.addEventListener(
    "click",
    closeModal
);


viewModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            viewModal
        ) {

            closeModal();
        }
    }
);


/* =========================
   DELETE FEEDBACK
========================= */

async function deleteFeedback(id) {

    const item =
        feedbackList.find(
            feedback =>
                feedback.id === id
        );


    if (!item) {

        showError(
            "Feedback not found"
        );

        return;
    }


    const username =
        item.user?.username ||
        "this user";


    const confirmed =
        window.confirm(
            `Are you sure you want to delete feedback #${id} from ${username}?`
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


        if (!response) {
            return;
        }


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
            error.message ||
            "Unable to delete feedback"
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
        function () {

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
        document.createElement(
            "div"
        );

    div.textContent =
        text ?? "";

    return div.innerHTML;
}


/* =========================
   INITIAL LOAD
========================= */

loadFeedback();