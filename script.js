const API_URL = "https://amhep.pythonanywhere.com/grades";

document.addEventListener("DOMContentLoaded", () => {
    const seeGradesButton = document.getElementById("seeGradesButton");
    const addGradeButton = document.getElementById("addGradeButton");
    const editGradeButton = document.getElementById("editGradeButton");
    const getGradeButton = document.getElementById("getGradeButton");

    seeGradesButton.addEventListener("click", seeGrades);
    addGradeButton.addEventListener("click", addGrade);
    editGradeButton.addEventListener("click", editGrade);
    getGradeButton.addEventListener("click", getGrade);
    
    // Edit Grade
    async function editGrade() {
        const name = document.getElementById("editStudentName").value.trim();
        const grade = document.getElementById("editStudentGrade").value.trim();

        if (!name || !grade) {
            alert("Please enter both a name and a new grade.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${encodeURIComponent(name)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ grade: parseFloat(grade) })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to update grade: ${errorData.error}`);
                return;
            }

            alert(`Grade for ${name} updated to ${grade}`);
            seeGrades();
        } catch (error) {
            console.error("Error updating grade:", error);
            alert("An error occurred while updating the grade.");
        }
    }

// add grade 
    async function addGrade() {
        const name = document.getElementById("editStudentName").value.trim();
        const grade = document.getElementById("editStudentGrade").value.trim();

        if (!name || !grade) {
            alert("Please enter both a name and a grade.");
            return;
        }

        try {
            const response = await fetch("https://amhep.pythonanywhere.com/grades", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, grade: parseFloat(grade) })
            });

            if (response.ok) {
                alert("Grade added successfully!");
                document.getElementById("editStudentName").value = "";
                document.getElementById("editStudentGrade").value = "";
            } else {
                const errorData = await response.json();
                console.error("Error adding grade:", errorData);
                alert("Failed to add grade.");
            }
        } catch (error) {
            console.error("Error adding grade:", error);
            alert("An error occurred while adding the grade.");
        }
    }
    // Get Grade
    async function getGrade() {
        const name = document.getElementById("editStudentName").value.trim();

        if (!name) {
            alert("Please enter a name.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${encodeURIComponent(name)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            let text = await response.text();
            text = text.replace(/NaN/g, "null");
            let data;

            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error("Error parsing JSON:", text);
                alert("Error fetching grade. Check console for details.");
                return;
            }

            if (data) {
                alert(`Grade for ${name}: ${data[name]}`);
            } else {
                console.log(data);
                alert(`No valid grade found for ${name}`);
                
            }
        } catch (error) {
            console.error("Error getting grade:", error);
            alert("An error occurred while getting the grade.");
        }
    }

// delete
const deleteGrade = async (name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(name)}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            alert("Failed to delete grade.");
            return;
        }

        alert(`${name} deleted successfully.`);
        seeGrades(); // Refresh the table
    } catch (error) {
        console.error("Error deleting grade:", error);
        alert("An error occurred while deleting the grade.");
    }
};

// See Grades
async function seeGrades() {
    const popupContainer = document.getElementById("popupContainer");

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let text = await response.text();
        text = text.replace(/NaN/g, "null");
        let data;

        try {
            data = JSON.parse(text);
        } catch (error) {
            console.error("Error parsing JSON:", text);
            alert("Error fetching grades. Check console for details.");
            return;
        }

        let tableHTML = `
            <div id="popupTable">
                <table style="width:500px">
                    <tr>
                        <th>Name</th>
                        <th>Grade</th>
                        <th>Actions</th>
                    </tr>
        `;

        if (data && typeof data === 'object') {
            for (const [name, grade] of Object.entries(data)) {
                if (typeof grade === 'number' && grade !== null) {
                    tableHTML += `
                        <tr>
                            <td>${name.replace(/\u0000/g, '')}</td>
                            <td><input type="number" value="${grade}" id="grade-${name}"></td>
                            <td>
                                <button class="delete-btn" data-name="${name}">Delete</button>
                            </td>
                        </tr>
                    `;
                }
            }
        } else {
            tableHTML += `<tr><td colspan="3">No grades found.</td></tr>`;
        }

        tableHTML += `</table></div>`;
        popupContainer.innerHTML = tableHTML;

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => deleteGrade(button.dataset.name));
        });

    } catch (error) {
        console.error("Error fetching grades:", error);
        popupContainer.innerHTML = `<p>Error loading grades.</p>`;
    }
}

});