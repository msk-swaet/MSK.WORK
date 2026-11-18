
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

/* =========================
   MSK.WORK
   CALCUL DES MOYENNES
========================= */

const averageForm = document.getElementById("average-form");

if (averageForm) {

    let subjects = JSON.parse(
        localStorage.getItem("msk-work-averages") || "[]"
    );

    const subjectInput = document.getElementById("average-subject");
    const coefficientInput = document.getElementById("average-coefficient");
    const grade1Input = document.getElementById("grade-1");
    const grade2Input = document.getElementById("grade-2");
    const compositionInput = document.getElementById("composition");

    const averageId = document.getElementById("average-id");
    const averageList = document.getElementById("average-list");
    const generalAverage = document.getElementById("general-average");
    const subjectTotal = document.getElementById("subject-total");

    const formTitle = document.getElementById("average-form-title");
    const saveButton = document.getElementById("save-average");
    const cancelButton = document.getElementById("cancel-average");

    function saveSubjects() {
        localStorage.setItem(
            "msk-work-averages",
            JSON.stringify(subjects)
        );
    }

    function calculateSubject(subject) {
        const homeworkAverage =
            (subject.grade1 + subject.grade2) / 2;

        return (homeworkAverage + subject.composition) / 2;
    }

    function calculateGeneralAverage() {

        if (subjects.length === 0) return null;

        let totalPoints = 0;
        let totalCoefficients = 0;

        subjects.forEach(subject => {
            const average = calculateSubject(subject);

            totalPoints += average * subject.coefficient;
            totalCoefficients += subject.coefficient;
        });

        return totalPoints / totalCoefficients;
    }

    function renderAverages() {

        averageList.innerHTML = "";

        const general = calculateGeneralAverage();

        generalAverage.textContent = general === null
            ? "-- / 20"
            : general.toFixed(2).replace(".", ",") + " / 20";

        subjectTotal.textContent =
            subjects.length + (subjects.length > 1
                ? " matières"
                : " matière");

        if (subjects.length === 0) {
            averageList.innerHTML = `
                <div class="empty-average">
                    <p>Aucune matière enregistrée.</p>
                    <p>Ajoute ta première matière pour commencer ! ✨</p>
                </div>
            `;
            return;
        }

        subjects.forEach(subject => {

            const average = calculateSubject(subject);

            const card = document.createElement("div");
            card.className = "average-card";

            const info = document.createElement("div");

            const title = document.createElement("h3");
            title.textContent = subject.name;

            const details = document.createElement("p");
            details.className = "average-details";
            details.textContent =
                "Devoir 1 : " + subject.grade1 +
                " | Devoir 2 : " + subject.grade2 +
                " | Composition : " + subject.composition +
                " | Coefficient : " + subject.coefficient;

            const actions = document.createElement("div");
            actions.className = "average-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Modifier";

            editButton.addEventListener("click", () => {
                editSubject(subject.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Supprimer";

            deleteButton.addEventListener("click", () => {
                deleteSubject(subject.id);
            });

            actions.append(editButton, deleteButton);
            info.append(title, details, actions);

            const score = document.createElement("div");
            score.className = "average-score";
            score.textContent =
                average.toFixed(2).replace(".", ",") + " / 20";

            card.append(info, score);
            averageList.appendChild(card);
        });
    }

    function resetAverageForm() {
        averageForm.reset();
        averageId.value = "";

        formTitle.textContent = "Ajouter une matière";
        saveButton.textContent = "Ajouter la matière";
        cancelButton.hidden = true;
    }

    averageForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = subjectInput.value.trim();
        const coefficient = Number(coefficientInput.value);
        const grade1 = Number(grade1Input.value);
        const grade2 = Number(grade2Input.value);
        const composition = Number(compositionInput.value);

        if (
            !name ||
            !Number.isFinite(coefficient) ||
            coefficient <= 0 ||
            !Number.isFinite(grade1) ||
            !Number.isFinite(grade2) ||
            !Number.isFinite(composition) ||
            grade1 < 0 || grade1 > 20 ||
            grade2 < 0 || grade2 > 20 ||
            composition < 0 || composition > 20
        ) {
            alert("Vérifie tes notes et ton coefficient.");
            return;
        }

        const id = averageId.value;

        const subject = {
            id: id || (
                Date.now().toString() +
                Math.random().toString(36).slice(2)
            ),
            name,
            coefficient,
            grade1,
            grade2,
            composition
        };

        if (id) {
            const index = subjects.findIndex(item => item.id === id);

            if (index !== -1) {
                subjects[index] = subject;
            }
        } else {
            subjects.push(subject);
        }

        saveSubjects();
        renderAverages();
        resetAverageForm();
    });

    function editSubject(id) {

        const subject = subjects.find(item => item.id === id);

        if (!subject) return;

        averageId.value = subject.id;
        subjectInput.value = subject.name;
        coefficientInput.value = subject.coefficient;
        grade1Input.value = subject.grade1;
        grade2Input.value = subject.grade2;
        compositionInput.value = subject.composition;

        formTitle.textContent = "Modifier la matière";
        saveButton.textContent = "Enregistrer les modifications";
        cancelButton.hidden = false;

        averageForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    function deleteSubject(id) {

        if (!confirm("Supprimer cette matière et ses notes ?")) {
            return;
        }

        subjects = subjects.filter(item => item.id !== id);

        saveSubjects();
        renderAverages();
        resetAverageForm();
    }

    cancelButton.addEventListener("click", resetAverageForm);

    renderAverages();
}

