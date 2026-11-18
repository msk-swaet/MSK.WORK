
/* =========================
   MSK.WORK
   EMPLOI DU TEMPS
========================= */

const courseForm = document.getElementById("course-form");

if (courseForm) {

    const days = [
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
        "Dimanche"
    ];

    let courses = JSON.parse(
        localStorage.getItem("msk-work-courses") || "[]"
    );

    const subject = document.getElementById("subject");
    const day = document.getElementById("day");
    const start = document.getElementById("start");
    const end = document.getElementById("end");
    const room = document.getElementById("room");
    const color = document.getElementById("color");
    const courseId = document.getElementById("course-id");

    const scheduleList = document.getElementById("schedule-list");
    const courseCount = document.getElementById("course-count");
    const formTitle = document.getElementById("form-title");
    const saveButton = document.getElementById("save-course");
    const cancelButton = document.getElementById("cancel-edit");

    function saveCourses() {
        localStorage.setItem(
            "msk-work-courses",
            JSON.stringify(courses)
        );
    }

    function renderCourses() {

        scheduleList.innerHTML = "";

        courseCount.textContent =
            courses.length + (courses.length > 1 ? " cours" : " cours");

        if (courses.length === 0) {
            scheduleList.innerHTML = `
                <div class="empty-schedule">
                    <p>Ton emploi du temps est encore vide.</p>
                    <p>Ajoute ton premier cours pour commencer ! ✨</p>
                </div>
            `;
            return;
        }

        days.forEach(currentDay => {

            const dayCourses = courses
                .filter(course => course.day === currentDay)
                .sort((a, b) => a.start.localeCompare(b.start));

            if (dayCourses.length === 0) return;

            const group = document.createElement("div");
            group.className = "day-group";

            const heading = document.createElement("h3");
            heading.className = "day-heading";
            heading.textContent = currentDay;

            group.appendChild(heading);

            dayCourses.forEach(course => {

                const card = document.createElement("div");
                card.className = "course-card";
                card.style.setProperty(
                    "--course-color",
                    course.color
                );

                const info = document.createElement("div");
                info.className = "course-info";

                const title = document.createElement("h3");
                title.textContent = course.subject;

                const details = document.createElement("p");
                details.textContent = course.room
                    ? "Salle : " + course.room
                    : "Salle non précisée";

                info.append(title, details);

                const time = document.createElement("div");
                time.className = "course-time";
                time.textContent = course.start + " – " + course.end;

                const actions = document.createElement("div");
                actions.className = "course-actions";

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.textContent = "Modifier";
                editButton.addEventListener("click", () => {
                    editCourse(course.id);
                });

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.textContent = "Supprimer";
                deleteButton.addEventListener("click", () => {
                    deleteCourse(course.id);
                });

                actions.append(editButton, deleteButton);
                card.append(info, time, actions);
                group.appendChild(card);
            });

            scheduleList.appendChild(group);
        });
    }

    function resetForm() {
        courseForm.reset();
        courseId.value = "";
        color.value = "#9146cc";
        formTitle.textContent = "Ajouter un cours";
        saveButton.textContent = "Ajouter le cours";
        cancelButton.hidden = true;
    }

    courseForm.addEventListener("submit", function(event) {

        event.preventDefault();

        if (start.value >= end.value) {
            alert("L'heure de fin doit être après l'heure de début.");
            return;
        }

        const existingId = courseId.value;

        const course = {
            id: existingId || (
                Date.now().toString() + Math.random().toString(36).slice(2)
            ),
            subject: subject.value.trim(),
            day: day.value,
            start: start.value,
            end: end.value,
            room: room.value.trim(),
            color: color.value
        };

        if (existingId) {
            const index = courses.findIndex(
                item => item.id === existingId
            );

            if (index !== -1) {
                courses[index] = course;
            }
        } else {
            courses.push(course);
        }

        saveCourses();
        renderCourses();
        resetForm();
    });

    function editCourse(id) {

        const course = courses.find(item => item.id === id);

        if (!course) return;

        courseId.value = course.id;
        subject.value = course.subject;
        day.value = course.day;
        start.value = course.start;
        end.value = course.end;
        room.value = course.room;
        color.value = course.color;

        formTitle.textContent = "Modifier le cours";
        saveButton.textContent = "Enregistrer les modifications";
        cancelButton.hidden = false;

        courseForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function deleteCourse(id) {

        if (!confirm("Veux-tu vraiment supprimer ce cours ?")) {
            return;
        }

        courses = courses.filter(item => item.id !== id);

        saveCourses();
        renderCourses();
        resetForm();
    }

    cancelButton.addEventListener("click", resetForm);

    renderCourses();
}

